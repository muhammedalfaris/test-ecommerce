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
    const token = getToken();
    
    if (token) {
      if (isTokenExpired(token)) {
        logout();
        return;
      }

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