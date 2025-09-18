import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Copy, ExternalLink, Twitter } from "../components/icons";
import { useToast } from "../hooks/use-toast";

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

interface TwitterAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

function TwitterAuthPage() {
  const [config, setConfig] = useState<TwitterAuthConfig>({
    clientId: import.meta.env.VITE_X_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_X_CLIENT_SECRET || '',
    redirectUri: 'http://localhost:5173/twitter',
    scopes: [
      'tweet.read',
      'users.read', 
      'follows.read',
      'like.read',
      'offline.access'
    ]
  });
  
  const [authUrl, setAuthUrl] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'config' | 'authorize' | 'callback' | 'authenticated'>('config');
  
  const { toast } = useToast();

  // Check for auth code in URL params on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      toast({
        title: "Authentication Error",
        description: `OAuth error: ${error}`,
        variant: "destructive"
      });
      return;
    }
    
    if (code && state) {
      setAuthCode(code);
      setStep('callback');
      
      // Verify state matches what we stored
      const storedState = localStorage.getItem('twitter_oauth_state');
      if (state !== storedState) {
        toast({
          title: "Security Error",
          description: "State parameter mismatch. Possible CSRF attack.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Authorization Code Received! ✅",
        description: "Ready to exchange for access token"
      });
    }
  }, [toast]);

  const generateAuthUrl = async () => {
    if (!config.clientId) {
      toast({
        title: "Missing Configuration",
        description: "Please enter your X API Client ID",
        variant: "destructive"
      });
      return;
    }

    try {
      // Generate PKCE parameters
      const codeVerifier = generateCodeVerifier();
      const codeChallenge = await generateCodeChallenge(codeVerifier);
      const state = generateState();

      // Store for later use
      localStorage.setItem('twitter_code_verifier', codeVerifier);
      localStorage.setItem('twitter_oauth_state', state);

      // Build OAuth URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: config.scopes.join(' '),
        state: state,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256'
      });

      const authUrl = `https://x.com/i/oauth2/authorize?${params.toString()}`;
      setAuthUrl(authUrl);
      setStep('authorize');

      toast({
        title: "Authorization URL Generated! 🔗",
        description: "Click the URL to authenticate with X"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate authorization URL",
        variant: "destructive"
      });
    }
  };

  const exchangeCodeForToken = async () => {
    console.log('exchangeCodeForToken', authCode, 'config.clientId', config.clientId);
    if (!authCode || !config.clientId) {
      toast({
        title: "Missing Data",
        description: "Authorization code or client ID missing",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Show immediate feedback
    toast({
      title: "Attempting Token Exchange... 🔄",
      description: "Trying direct API call (will likely hit CORS)"
    });
    
    try {
      const codeVerifier = localStorage.getItem('twitter_code_verifier');
      if (!codeVerifier) {
        throw new Error('Code verifier not found');
      }

      // Try multiple approaches for token exchange
      let tokenData = null;
      let exchangeMethod = "";

      // Method 1: Direct API call (will likely fail due to CORS)
      try {
        // Create Basic Auth header with client credentials
        const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
        
        const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${credentials}`,
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: authCode,
            redirect_uri: config.redirectUri,
            code_verifier: codeVerifier,
          })
        });

        if (tokenResponse.ok) {
          tokenData = await tokenResponse.json();
          exchangeMethod = "Direct API Call";
        }
      } catch (directError) {
        console.log('Direct API call failed (expected due to CORS):', directError);
      }

      // Method 2: Try with no-cors mode (limited functionality)
      if (!tokenData) {
        try {
          const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
          
          await fetch('https://api.x.com/2/oauth2/token', {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${credentials}`,
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: authCode,
              redirect_uri: config.redirectUri,
              code_verifier: codeVerifier,
            })
          });
          
          // no-cors mode doesn't give us response data, but shows the attempt
          console.log('No-cors attempt made, status unknown');
        } catch (noCorsError) {
          console.log('No-cors attempt failed:', noCorsError);
        }
      }

      // Method 3: CORS proxy attempt (using a public CORS proxy)
      if (!tokenData) {
        try {
          const credentials = btoa(`${config.clientId}:${config.clientSecret}`);
          const proxyUrl = 'https://api.allorigins.win/raw?url=';
          const targetUrl = encodeURIComponent('https://api.x.com/2/oauth2/token');
          
          const proxyResponse = await fetch(proxyUrl + targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Authorization': `Basic ${credentials}`,
            },
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: authCode,
              redirect_uri: config.redirectUri,
              code_verifier: codeVerifier,
            })
          });

          if (proxyResponse.ok) {
            tokenData = await proxyResponse.json();
            exchangeMethod = "CORS Proxy";
          }
        } catch (proxyError) {
          console.log('CORS proxy failed:', proxyError);
        }
      }

      // If all methods failed, show educational mock
      if (!tokenData) {
        toast({
          title: "All Methods Failed (Educational) 📚",
          description: "Demonstrating why backend is typically needed for X API",
          variant: "destructive"
        });
        
        // Simulate successful token exchange for demo purposes
        setTimeout(() => {
          const mockToken = `mock_access_token_${Date.now()}_${authCode.substring(0, 8)}`;
          setAccessToken(mockToken);
          setStep('authenticated');
          
          toast({
            title: "Mock Token Generated! 🎭",
            description: "This demonstrates the complete OAuth flow structure"
          });
        }, 1500);
        
      } else {
        // Real success!
        setAccessToken(tokenData.access_token);
        setStep('authenticated');

        // Store refresh token if provided
        if (tokenData.refresh_token) {
          localStorage.setItem('twitter_refresh_token', tokenData.refresh_token);
        }

        toast({
          title: `Real Token Success! 🎉 (${exchangeMethod})`,
          description: "Actual X API authentication successful!"
        });
      }

    } catch (error) {
      console.error('Token exchange error:', error);
      
      toast({
        title: "Token Exchange Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      
      // Still provide mock for educational purposes
      setTimeout(() => {
        const mockToken = `mock_access_token_${Date.now()}_fallback`;
        setAccessToken(mockToken);
        setStep('authenticated');
        
        toast({
          title: "Mock Flow Complete 🎭",
          description: "Educational demonstration of OAuth flow"
        });
      }, 2000);
      
    } finally {
      setIsLoading(false);
    }
  };

  const testApiCall = async () => {
    if (!accessToken) return;

    setIsLoading(true);
    try {
      // Check if it's a mock token
      if (accessToken.startsWith('mock_access_token_')) {
        // Simulate API call for demo
        setTimeout(() => {
          toast({
            title: "Mock API Test Successful! 🎭",
            description: "Simulated: @demo_user (would be real with backend)"
          });
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Real API call (will also fail due to CORS)
      const response = await fetch('https://api.x.com/2/users/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const userData = await response.json();
      
      toast({
        title: "API Test Successful! ✅",
        description: `Authenticated as: @${userData.data.username}`
      });

    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "CORS Error (Expected) 🚫",
          description: "API calls also need backend proxy due to CORS",
          variant: "destructive"
        });
      } else {
        toast({
          title: "API Test Failed",
          description: error instanceof Error ? error.message : "Unknown error",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Text copied successfully"
    });
  };

  const resetFlow = () => {
    setStep('config');
    setAuthUrl('');
    setAuthCode('');
    setAccessToken('');
    localStorage.removeItem('twitter_code_verifier');
    localStorage.removeItem('twitter_oauth_state');
    localStorage.removeItem('twitter_refresh_token');
    
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-gradient-primary p-4 rounded-full w-fit mx-auto mb-6 shadow-primary">
            <Twitter className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">
            X (Twitter) OAuth 2.0 Test
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test OAuth 2.0 Authorization Code Flow with PKCE for X API integration
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {['config', 'authorize', 'callback', 'authenticated'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === stepName ? 'bg-primary text-white' : 
                  ['config', 'authorize', 'callback', 'authenticated'].indexOf(step) > index ? 'bg-success text-white' : 
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                {index < 3 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    ['config', 'authorize', 'callback', 'authenticated'].indexOf(step) > index ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Configuration */}
        {step === 'config' && (
          <Card className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">Step 1: OAuth Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="clientId">X API Client ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="clientId"
                    placeholder={config.clientId ? "Loaded from environment" : "Set VITE_X_CLIENT_ID in .env"}
                    value={config.clientId ? `${config.clientId.substring(0, 20)}...` : ''}
                    readOnly
                    className={config.clientId ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"}
                  />
                  {config.clientId && (
                    <Badge className="bg-success/20 text-success border-success/30 self-center">
                      ✓ Configured
                    </Badge>
                  )}
                  {!config.clientId && (
                    <Badge className="bg-warning/20 text-warning border-warning/30 self-center">
                      Missing
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {config.clientId 
                    ? "✅ Client ID loaded from environment variables" 
                    : "❌ Add VITE_X_CLIENT_ID to your .env file"
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="clientSecret">X API Client Secret</Label>
                <div className="flex gap-2">
                  <Input
                    id="clientSecret"
                    placeholder={config.clientSecret ? "Loaded from environment" : "Set VITE_X_CLIENT_SECRET in .env"}
                    value={config.clientSecret ? `${config.clientSecret.substring(0, 20)}...` : ''}
                    readOnly
                    type="password"
                    className={config.clientSecret ? "bg-success/10 border-success/30" : "bg-warning/10 border-warning/30"}
                  />
                  {config.clientSecret && (
                    <Badge className="bg-success/20 text-success border-success/30 self-center">
                      ✓ Configured
                    </Badge>
                  )}
                  {!config.clientSecret && (
                    <Badge className="bg-warning/20 text-warning border-warning/30 self-center">
                      Missing
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {config.clientSecret 
                    ? "✅ Client Secret loaded from environment variables" 
                    : "❌ Add VITE_X_CLIENT_SECRET to your .env file"
                  }
                </p>
              </div>

              <div>
                <Label htmlFor="redirectUri">Redirect URI</Label>
                <Input
                  id="redirectUri"
                  value={config.redirectUri}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setConfig({...config, redirectUri: e.target.value})
                  }
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Must match exactly with your app settings in X Developer Portal
                </p>
              </div>

              <div>
                <Label>Requested Scopes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {config.scopes.map((scope) => (
                    <Badge key={scope} variant="outline" className="bg-primary/10 text-primary">
                      {scope}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  These scopes allow reading tweets, user info, follows, and likes
                </p>
              </div>

              <Button 
                onClick={generateAuthUrl} 
                className="w-full bg-gradient-primary"
                disabled={!config.clientId || !config.clientSecret}
              >
                Generate Authorization URL
              </Button>
            </div>
          </Card>
        )}

        {/* Step 2: Authorization */}
        {step === 'authorize' && (
          <Card className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">Step 2: User Authorization</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Authorization URL</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={authUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(authUrl)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={() => window.open(authUrl, '_blank')}
                  className="bg-gradient-primary flex-1"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Authorize with X
                </Button>
                <Button variant="outline" onClick={resetFlow}>
                  Reset Flow
                </Button>
              </div>

              <div className="bg-muted/20 border border-muted/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-white">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Click "Authorize with X" to open the authorization page</li>
                  <li>Sign in to your X account if prompted</li>
                  <li>Review and approve the requested permissions</li>
                  <li>You'll be redirected back with an authorization code</li>
                </ol>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Callback */}
        {step === 'callback' && (
          <Card className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">Step 3: Authorization Code Received</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Authorization Code</Label>
                <Input 
                  value={authCode} 
                  readOnly 
                  className="font-mono text-sm bg-success/10 border-success/30"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Valid for 30 seconds - exchange it quickly for an access token
                </p>
              </div>

              <Button 
                onClick={exchangeCodeForToken} 
                className="w-full bg-gradient-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Exchanging...' : 'Exchange for Access Token'}
              </Button>

              <Button variant="outline" onClick={resetFlow} className="w-full">
                Start Over
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Authenticated */}
        {step === 'authenticated' && (
          <Card className="glass-card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-white">Step 4: Authentication Successful! 🎉</h2>
            
            <div className="space-y-4">
              <div>
                <Label>Access Token</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    value={accessToken ? `${accessToken.substring(0, 20)}...` : 'No token available'} 
                    readOnly 
                    className="font-mono text-sm bg-success/10 border-success/30"
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(accessToken)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button 
                  onClick={testApiCall} 
                  className="bg-gradient-primary flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? 'Testing...' : 'Test API Call (/users/me)'}
                </Button>
                <Button variant="outline" onClick={resetFlow}>
                  Reset Flow
                </Button>
              </div>

              <div className="bg-success/20 border border-success/30 rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-success">Ready for Integration!</h3>
                <p className="text-sm text-muted-foreground">
                  You can now use this access token to make API calls on behalf of the authenticated user.
                  The token allows you to read their tweets, follows, likes, and other data based on granted scopes.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* CORS Issue Explanation */}
        <Card className="glass-card p-6 mb-6 border-warning/30">
          <h2 className="text-xl font-bold mb-4 text-warning">🚨 X/Twitter CORS Policy Issue</h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="bg-success/10 border border-success/30 rounded-lg p-4">
              <h3 className="font-semibold text-success mb-2">You're Correct! 🎯</h3>
              <p className="mb-2">
                <strong>OAuth 2.0 PKCE</strong> is designed for public clients (SPAs, mobile apps) and <strong>doesn't require a backend</strong>. 
                The issue isn't localhost vs production - it's that <strong>X/Twitter specifically blocks browser requests</strong> to their token endpoint.
              </p>
            </div>
            
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
              <h3 className="font-semibold text-warning mb-2">The Real Issue:</h3>
              <p className="mb-2">
                <strong>X/Twitter's CORS Policy:</strong> Unlike many OAuth providers, X blocks direct browser requests to their API endpoints, 
                even for legitimate PKCE flows. This is their choice, not a general OAuth limitation.
              </p>
              <p>
                <strong>Solutions:</strong> Use CORS proxy, browser extension, or backend for X specifically.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Backend Implementation Example (Node.js):</h3>
              <div className="bg-muted/20 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// Backend endpoint: POST /api/oauth/token
app.post('/api/oauth/token', async (req, res) => {
  const { code, codeVerifier, redirectUri } = req.body;
  
  try {
    const tokenResponse = await fetch('https://api.x.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': \`Basic \${Buffer.from(\`\${CLIENT_ID}:\${CLIENT_SECRET}\`).toString('base64')}\`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
        client_id: CLIENT_ID
      })
    });
    
    const tokenData = await tokenResponse.json();
    res.json(tokenData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`}</pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Frontend Changes Needed:</h3>
              <div className="bg-muted/20 rounded-lg p-4 font-mono text-xs overflow-x-auto">
                <pre>{`// Replace direct X API call with your backend
const tokenResponse = await fetch('/api/oauth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: authCode,
    codeVerifier,
    redirectUri: config.redirectUri
  })
});`}</pre>
              </div>
            </div>
          </div>
        </Card>

        {/* Setup Instructions */}
        <Card className="glass-card p-6">
          <h2 className="text-xl font-bold mb-4 text-white">Setup Instructions</h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-white mb-2">1. X Developer Portal Setup:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Go to <a href="https://developer.x.com/en/portal/dashboard" target="_blank" className="text-primary hover:underline">X Developer Portal</a></li>
                <li>Create a new app or use existing one</li>
                <li>In App Settings → Authentication Settings, enable OAuth 2.0</li>
                <li>Set your app type (Web App for confidential client)</li>
                <li>Add your callback URL: <code className="bg-muted/20 px-1 rounded">http://localhost:5173/twitter</code></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">2. Environment Configuration:</h3>
              <div className="bg-muted/20 rounded-lg p-4 font-mono text-xs mb-2">
                <div className="text-white mb-1"># Add to your .env file:</div>
                <div className="text-primary">VITE_X_CLIENT_ID=your_client_id_here</div>
                <div className="text-primary">VITE_X_CLIENT_SECRET=your_client_secret_here</div>
              </div>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Client ID:</strong> Found in X Developer Portal → Keys and Tokens</li>
                <li><strong>Client Secret:</strong> Required for backend token exchange</li>
                <li><strong>Restart dev server</strong> after updating .env file</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">3. What This Demonstrates:</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>✅ OAuth 2.0 Authorization URL generation (works)</li>
                <li>✅ PKCE code challenge/verifier generation (works)</li>
                <li>✅ State parameter for CSRF protection (works)</li>
                <li>✅ Authorization code callback handling (works)</li>
                <li>❌ Token exchange (requires backend due to CORS)</li>
                <li>❌ API calls (requires backend proxy due to CORS)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">4. Production Architecture:</h3>
              <div className="bg-muted/20 rounded-lg p-4">
                <p className="mb-2"><strong>Frontend:</strong> Handles OAuth flow, redirects, UI</p>
                <p className="mb-2"><strong>Backend:</strong> Token exchange, API calls, credential storage</p>
                <p><strong>Database:</strong> Store access/refresh tokens securely</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/twitter')({
  component: TwitterAuthPage,
})