import { User } from '@/src/store/authSlice';
import { useAuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useEffect, useState } from 'react';

// Google OAuth configuration
// NOTE: Replace with your actual Google OAuth client ID
// For development, you can use a placeholder
// In production, get your client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

// OAuth scopes - IDENTITY ONLY (Phase 1)
// Do NOT add Drive, Calendar, or other extended scopes
const SCOPES = [
  'openid',
  'profile',
  'email',
];

// Complete the auth session when the web browser returns
WebBrowser.maybeCompleteAuthSession();

/**
 * Get the redirect URI for OAuth
 */
function getRedirectUri(): string {
  // Use the scheme for native redirects
  return 'nest://oauth2redirect';
}

/**
 * Google Sign-In Hook for React components
 * Handles the complete OAuth flow
 */
export function useGoogleSignIn() {
  const [user, setUser] = useState<User | null>(null);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const redirectUri = getRedirectUri();
  
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: SCOPES,
      redirectUri,
      usePKCE: true,
    },
    {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    }
  );

  useEffect(() => {
    const handleAuthResult = async () => {
      if (response?.type === 'success') {
        setIsLoading(true);
        try {
          const { params } = response;
          const token = params?.id_token || params?.idToken;
          
          if (token) {
            const userInfo = decodeIdToken(token);
            setUser(userInfo);
            setIdToken(token);
          }
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
          setIsLoading(false);
        }
      }
    };

    handleAuthResult();
  }, [response]);

  const signIn = useCallback(() => {
    setError(null);
    return promptAsync();
  }, [promptAsync]);

  const signOut = useCallback(() => {
    setUser(null);
    setIdToken(null);
  }, []);

  return {
    user,
    idToken,
    error,
    isLoading,
    signIn,
    signOut,
    isSignedIn: !!user && !!idToken,
  };
}

/**
 * Sign in with Google (imperative version)
 * Returns user profile and idToken on success
 */
export async function signInWithGoogle(): Promise<{
  user: User;
  idToken: string;
}> {
  const redirectUri = getRedirectUri();
  
  // Build the authorization URL
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(SCOPES.join(' '))}&access_type=offline&prompt=consent`;

  // Start the browser auth session
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== 'success') {
    throw new Error('Google sign-in was cancelled or failed');
  }

  // Parse the redirect URL to get the params
  const url = result.url;
  const params = new URLSearchParams(url.split('?')[1]);
  const token = params.get('id_token');

  if (!token) {
    throw new Error('No ID token received from Google');
  }

  // Decode the ID token to get user info
  const user = decodeIdToken(token);

  return { user, idToken: token };
}

/**
 * Decode Google ID token to extract user information
 */
function decodeIdToken(idToken: string): User {
  try {
    // JWT token is base64url encoded
    // Format: header.payload.signature
    const payload = idToken.split('.')[1];
    
    // Decode base64url
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const payloadObj = JSON.parse(decoded);

    return {
      id: payloadObj.sub,
      name: payloadObj.name || 'Unknown User',
      email: payloadObj.email || '',
      avatar: payloadObj.picture,
    };
  } catch (error) {
    console.error('Error decoding ID token:', error);
    throw new Error('Failed to decode user information from Google');
  }
}

/**
 * Check if Google sign-in is available on this platform
 */
export async function isGoogleSignInAvailable(): Promise<boolean> {
  try {
    const redirectUri = getRedirectUri();
    return !!redirectUri;
  } catch {
    return false;
  }
}

/**
 * Sign out from Google
 * Note: This only clears local state, doesn't revoke tokens
 * Token revocation is not implemented per Phase 1 requirements
 */
export async function signOut(): Promise<void> {
  // For Phase 1, we just clear local state
  // Token revocation would require backend API call
  console.log('Google sign-out called (local state only)');
}

