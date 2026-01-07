import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getUserFromToken, isTokenExpired } from '@/lib/token';

// Helper to get token from cookies (client-side only)
function getTokenFromCookie(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return value || null;
    }
  }
  
  return null;
}

export function useAuth() {
  const { 
    isAuthenticated, 
    user, 
    setUser, 
    logout 
  } = useAuthStore();

  useEffect(() => {
    const token = getTokenFromCookie();
    
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        return;
      }

      if (!isAuthenticated || !user) {
        const userData = getUserFromToken(token);
        if (userData) {
          setUser(userData);
        } else {
          logout();
        }
      }
    } else if (isAuthenticated) {
      logout();
    }
  }, []);

  return {
    isAuthenticated,
    user,
    logout,
  };
}