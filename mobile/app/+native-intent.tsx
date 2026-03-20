/**
 * Intent: Rewrite magic-link deep link URLs so Expo Router doesn't show "Unmatched Route".
 * Handles mobile:// and exp:// auth callback URLs by routing them to /auth-callback.
 */
export function redirectSystemPath({ path, initial }: { path: string; initial: boolean }) {
  // Always log what we receive to debug
  console.log('[+native-intent] redirectSystemPath called:', { path, initial });
  
  if (!initial) {
    console.log('[+native-intent] Not initial launch, returning original path');
    return path;
  }
  
  try {
    const pathLower = (path || '').toLowerCase();

    // Catch-all: any path that looks like a mobile:// URL (including just "mobile:///")
    if (pathLower.startsWith('mobile://')) {
      console.log('[+native-intent] Matched mobile:// URL, redirecting to /auth-callback');
      return '/auth-callback';
    }

    // Root paths
    if (path === '/' || path === '') {
      console.log('[+native-intent] Matched root path, redirecting to /auth-callback');
      return '/auth-callback';
    }

    // Auth callback paths
    if (
      pathLower === 'auth/callback' ||
      pathLower === '/auth/callback' ||
      pathLower.startsWith('auth/callback?') ||
      pathLower.startsWith('auth/callback#') ||
      pathLower.startsWith('/auth/callback?') ||
      pathLower.startsWith('/auth/callback#')
    ) {
      console.log('[+native-intent] Matched auth/callback path, redirecting to /auth-callback');
      return '/auth-callback';
    }

    // URLs with tokens
    if (pathLower.includes('access_token') && pathLower.includes('refresh_token')) {
      console.log('[+native-intent] Matched URL with tokens, redirecting to /auth-callback');
      return '/auth-callback';
    }

    // Exp:// URLs containing auth
    if (pathLower.startsWith('exp://') && pathLower.includes('auth')) {
      console.log('[+native-intent] Matched exp:// auth URL, redirecting to /auth-callback');
      return '/auth-callback';
    }

    console.log('[+native-intent] No match, returning original path');
    return path;
  } catch (error) {
    console.error('[+native-intent] Error in redirectSystemPath:', error);
    return path;
  }
}
