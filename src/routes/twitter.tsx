import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Twitter } from "../components/icons";
import { useToast } from "../hooks/use-toast";
import { XOAuthAPI, getBackendUrl, generateXOAuthUrl } from "../libs/api";

// OAuth 2.0 PKCE Helper Functions
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function generateCodeChallenge(codeVerifier: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  return crypto.subtle.digest('SHA-256', data).then(digest => {
    return btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(digest))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  });
}

function generateState() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function TwitterAuthPage() {
  const [config] = useState({
    clientId: import.meta.env.VITE_X_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/twitter`,
    scopes: ['tweet.read', 'users.read', 'follows.read', 'like.read', 'offline.access']
  });
  
  const [authUrl, setAuthUrl] = useState('');
  const [tokens, setTokens] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'config' | 'auth' | 'callback' | 'success' | 'error'>('config');
  
  const { toast } = useToast();

  // Check for auth code in URL params on mount  
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const urlError = urlParams.get('error');
    
    if (urlError) {
      setError(`OAuth error: ${urlError}`);
      setStep('error');
      return;
    }
    
    if (code && state) {
      setStep('callback');
      handleTokenExchange(code, state);
    }
  }, []);

  const testBackendConnection = async () => {
    try {
      const health = await XOAuthAPI.testBackendConnection();
      console.log('Backend connection successful:', health);
    } catch (error) {
      console.warn('Backend connection failed:', error);
      setError(`Backend not available: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateAuthUrl = async () => {
    if (!config.clientId) {
      setError('Client ID is required. Set VITE_X_CLIENT_ID in your .env file.');
      setStep('error');
      return;
    }

    try {
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateState();
      
      // Store PKCE values for token exchange
      localStorage.setItem('oauth_code_verifier', codeVerifier);
      localStorage.setItem('oauth_state', state);
      
      const authUrl = generateXOAuthUrl(
        config.clientId,
        config.redirectUri,
        codeChallenge,
        state,
        config.scopes
      );
      
      setAuthUrl(authUrl);
      setStep('auth');
      
      toast({
        title: "✅ Ready to Authenticate",
        description: "Authorization URL generated. Click link below to continue.",
      });
      
    } catch (error) {
      console.error('Failed to generate auth URL:', error);
      setError(`Failed to generate auth URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep('error');
    }
  };

  const handleTokenExchange = async (code: string, state: string) => {
    const codeVerifier = localStorage.getItem('oauth_code_verifier');
    const storedState = localStorage.getItem('oauth_state');
    
    if (!codeVerifier || !storedState || storedState !== state) {
      setError('Invalid OAuth state. Please restart the authentication flow.');
      setStep('error');
      return;
    }

    setIsLoading(true);

    try {
      const tokenData = await XOAuthAPI.exchangeToken(code, codeVerifier, config.redirectUri);
      setTokens(tokenData);
      setStep('success');
      
      toast({
        title: "✅ Token Exchange Successful!",
        description: "Backend handled token exchange securely - CORS issue resolved!",
      });

      // Fetch user profile
      fetchUserProfile(tokenData.access_token);
      
    } catch (error) {
      console.error('Token exchange error:', error);
      setError(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure your backend is running.`);
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async (accessToken: string) => {
    try {
      const userData = await XOAuthAPI.getUserProfile(accessToken);
      setUserProfile(userData.data);
      
      toast({
        title: "✅ Profile Loaded!",
        description: `Welcome @${userData.data.username}!`,
      });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      setError(`Failed to fetch user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const resetFlow = () => {
    setStep('config');
    setError('');
    setTokens(null);
    setUserProfile(null);
    setAuthUrl('');
    localStorage.removeItem('oauth_code_verifier');
    localStorage.removeItem('oauth_state');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-6">
            <Twitter className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-white">X OAuth Demo (Backend Fixed)</h1>
              <p className="text-sm text-muted-foreground">
                Test X OAuth with PKCE flow. Backend handles token exchange securely, fixing CORS issues.
              </p>
            </div>
          </div>

          {/* Backend Status */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Backend URL:</span>
              <code className="text-xs bg-muted/20 px-2 py-1 rounded">{getBackendUrl()}</code>
              <Button 
                onClick={testBackendConnection}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                Test Connection
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
              <div className="text-red-400 font-medium">Error</div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          {/* Step: Configuration */}
          {step === 'config' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">OAuth Configuration</h2>
                
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                    <span className="text-sm">Client ID</span>
                    <Badge variant={config.clientId ? "default" : "outline"}>
                      {config.clientId ? "✅ Configured" : "❌ Missing"}
                    </Badge>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-400">🔒</span>
                      <span className="text-sm font-medium text-green-300">Client Secret Secured</span>
                    </div>
                    <p className="text-xs text-green-400/80">
                      Client secret is now securely stored in the backend environment (X_CLIENT_SECRET).
                      This fixes CORS issues and keeps your credentials safe.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    onClick={generateAuthUrl}
                    disabled={!config.clientId}
                    className="w-full"
                  >
                    {!config.clientId ? 'Configure client ID first' : 'Start X OAuth Flow'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Auth URL Generated */}
          {step === 'auth' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Authorize with X</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Click the link below to authorize your application with X:
                </p>
                <div className="p-4 bg-muted/10 rounded-lg break-all">
                  <a 
                    href={authUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 underline text-sm"
                  >
                    {authUrl}
                  </a>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={() => window.open(authUrl, '_blank')}>
                    Open Authorization URL
                  </Button>
                  <Button variant="outline" onClick={resetFlow}>
                    Reset Flow
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Processing Callback */}
          {step === 'callback' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-white mb-2">Processing Authorization...</h2>
              <p className="text-sm text-muted-foreground">
                Exchanging authorization code for access token via backend
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && tokens && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">✅</span>
                <h2 className="text-lg font-semibold text-white">Authentication Successful!</h2>
              </div>

              {/* Token Info */}
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-400/30 rounded-lg">
                  <div className="text-green-400 font-medium mb-2">Access Token Received</div>
                  <div className="text-xs text-green-300 font-mono bg-black/20 p-2 rounded">
                    {tokens.access_token?.substring(0, 20)}...
                  </div>
                </div>

                {/* User Profile */}
                {userProfile && (
                  <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                    <div className="text-blue-400 font-medium mb-2">User Profile</div>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {userProfile.name}</div>
                      <div><strong>Username:</strong> @{userProfile.username}</div>
                      <div><strong>ID:</strong> {userProfile.id}</div>
                      {userProfile.public_metrics && (
                        <div><strong>Followers:</strong> {userProfile.public_metrics.followers_count}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={resetFlow} variant="outline">
                  Test Again
                </Button>
              </div>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="text-lg font-semibold text-white mb-2">Authentication Failed</h2>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={resetFlow}>
                Try Again
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/twitter')({
  component: TwitterAuthPage,
});