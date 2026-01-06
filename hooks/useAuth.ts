import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { getToken, getUserFromToken, isTokenExpired } from '@/lib/token';

export function useAuth() {
  const { 
    isAuthenticated, 
    user, 
    accessToken, 
    setToken, 
    setUser, 
    logout 
  } = useAuthStore();

  useEffect(() => {
    // Check token on mount
    const token = getToken();
    
    if (token) {
      // Check if token is expired
      if (isTokenExpired(token)) {
        logout();
        return;
      }

      // If we have a token but store is not initialized
      if (!isAuthenticated || !user) {
        const userData = getUserFromToken(token);
        if (userData) {
          setToken(token);
          setUser(userData);
        } else {
          logout();
        }
      }
    } else if (isAuthenticated) {
      // No token but store says authenticated
      logout();
    }
  }, []);

  return {
    isAuthenticated,
    user,
    accessToken,
    logout,
  };
}