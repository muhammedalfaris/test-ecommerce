import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  user_id: string;
  name: string;
  phone_number: string;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setToken: (token: string) => void;
  setUser: (user: User) => void;
  login: (token: string, user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setToken: (token: string) => {
        localStorage.setItem('access_token', token);
        set({ accessToken: token, isAuthenticated: true });
      },
      
      setUser: (user: User) => set({ user }),
      
      login: (token: string, user: User) => {
        localStorage.setItem('access_token', token);
        set({ 
          accessToken: token, 
          user, 
          isAuthenticated: true,
          error: null 
        });
      },
      
      logout: () => {
        localStorage.removeItem('access_token');
        set({ 
          accessToken: null, 
          user: null, 
          isAuthenticated: false,
          error: null 
        });
      },
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      
      setError: (error: string | null) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        accessToken: state.accessToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);