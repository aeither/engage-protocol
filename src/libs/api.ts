// API configuration and utilities for frontend-backend communication

// Get backend URL from environment variable
export const getBackendUrl = (): string => {
  return import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
};

// X OAuth API calls using backend proxy
export class XOAuthAPI {
  private static getHeaders(accessToken?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };
    
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
    
    return headers;
  }

  // Exchange authorization code for access token (via backend)
  static async exchangeToken(code: string, codeVerifier: string, redirectUri: string): Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  }> {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/oauth/token`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        code,
        codeVerifier,
        redirectUri
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Token exchange failed: ${response.status}`);
    }

    return response.json();
  }

  // Get user profile (via backend proxy to avoid CORS)
  static async getUserProfile(accessToken: string): Promise<{
    data: {
      id: string;
      name: string;
      username: string;
      public_metrics?: {
        followers_count: number;
        following_count: number;
        tweet_count: number;
      };
      profile_image_url?: string;
    }
  }> {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/api/x/me`, {
      headers: this.getHeaders(accessToken)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to fetch user profile: ${response.status}`);
    }

    return response.json();
  }

  // Test backend connection
  static async testBackendConnection(): Promise<{ status: string; timestamp: string }> {
    const backendUrl = getBackendUrl();
    
    const response = await fetch(`${backendUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`Backend connection failed: ${response.status}`);
    }

    return response.json();
  }
}

// Helper function to generate OAuth URL (still done on frontend)
export function generateXOAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
  state: string,
  scopes: string[]
): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes.join(' '),
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  return `https://x.com/i/oauth2/authorize?${params.toString()}`;
}
