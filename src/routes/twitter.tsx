import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Twitter, ArrowLeft, CheckCircle } from "../components/icons";
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

function TwitterLinkPage() {
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
  const [step, setStep] = useState<'link' | 'auth' | 'callback' | 'success' | 'error'>('link');
  
  const { toast } = useToast();

  // Check for auth code in URL params or existing token on mount  
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
      return;
    }
    
    // Check for existing token in localStorage
    const existingToken = localStorage.getItem('x_access_token');
    if (existingToken) {
      setTokens({ access_token: existingToken });
      setStep('success');
      fetchUserProfile(existingToken);
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
      
      // Store token in localStorage for persistence
      if (tokenData.access_token) {
        localStorage.setItem('x_access_token', tokenData.access_token);
      }
      
      setError(''); // Clear any previous errors
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
      // Don't set error state since authentication was successful
      // Just show a toast notification for the profile fetch failure
      toast({
        title: "⚠️ Profile Fetch Warning",
        description: "Authentication successful, but couldn't load profile details.",
        variant: "destructive",
      });
    }
  };

  const signOut = () => {
    localStorage.removeItem('x_access_token');
    setTokens(null);
    setUserProfile(null);
    setStep('link');
    setError('');
    setAuthUrl('');
    localStorage.removeItem('oauth_code_verifier');
    localStorage.removeItem('oauth_state');
    
    toast({
      title: "✅ Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  const resetFlow = () => {
    setStep('link');
    setError('');
    setTokens(null);
    setUserProfile(null);
    setAuthUrl('');
    localStorage.removeItem('oauth_code_verifier');
    localStorage.removeItem('oauth_state');
  };

  const goToProfile = () => {
    window.location.href = '/profile';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto p-8">
          <div className="flex items-center gap-3 mb-6">
            <Button 
              onClick={goToProfile}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Twitter className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-white">Link Twitter Account</h1>
              <p className="text-sm text-muted-foreground">
                Connect your Twitter account to your profile
              </p>
            </div>
          </div>

          {/* Error Display */}
          {error && (step === 'error' || step === 'link') && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
              <div className="text-red-400 font-medium">Error</div>
              <div className="text-sm text-red-300">{error}</div>
            </div>
          )}

          {/* Step: Link Twitter */}
          {step === 'link' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Twitter className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Connect Your Twitter Account</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Link your Twitter account to access your profile information and connect with other users.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-white">Access your Twitter profile</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-white">View your followers and following</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-white">Connect with other users</span>
                  </div>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={generateAuthUrl}
                    disabled={!config.clientId}
                    className="w-full"
                    size="lg"
                  >
                    {!config.clientId ? 'Twitter integration not configured' : 'Link Twitter Account'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Auth URL Generated */}
          {step === 'auth' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Twitter className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Authorize with Twitter</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Click the button below to open Twitter and authorize the connection:
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => window.open(authUrl, '_blank')} size="lg">
                    Open Twitter Authorization
                  </Button>
                  <Button variant="outline" onClick={resetFlow}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Processing Callback */}
          {step === 'callback' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-lg font-semibold text-white mb-2">Linking Your Account...</h2>
              <p className="text-sm text-muted-foreground">
                Please wait while we connect your Twitter account
              </p>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && tokens && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-white mb-2">Twitter Account Linked!</h2>
                <p className="text-sm text-muted-foreground mb-6">
                  Your Twitter account has been successfully connected to your profile.
                </p>

                {/* User Profile */}
                {userProfile && (
                  <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg mb-6">
                    <div className="text-blue-400 font-medium mb-3">Connected Account</div>
                    <div className="flex items-center gap-3">
                      <img 
                        src={userProfile.profile_image_url} 
                        alt="Twitter Profile" 
                        className="w-12 h-12 rounded-full"
                      />
                      <div className="text-left">
                        <div className="font-medium text-white">{userProfile.name}</div>
                        <div className="text-sm text-muted-foreground">@{userProfile.username}</div>
                        {userProfile.public_metrics && (
                          <div className="text-xs text-muted-foreground">
                            {userProfile.public_metrics.followers_count} followers
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 justify-center">
                  <Button onClick={goToProfile} size="lg">
                    Go to Profile
                  </Button>
                  <Button onClick={signOut} variant="outline">
                    Unlink Account
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step: Error */}
          {step === 'error' && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">❌</div>
              <h2 className="text-lg font-semibold text-white mb-2">Connection Failed</h2>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <div className="flex gap-2 justify-center">
                <Button onClick={resetFlow}>
                  Try Again
                </Button>
                <Button onClick={goToProfile} variant="outline">
                  Back to Profile
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/twitter')({
  component: TwitterLinkPage,
});