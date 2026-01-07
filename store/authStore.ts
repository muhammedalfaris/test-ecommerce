import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  user_id: string;
  name: string;
  phone_number: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  login: (user: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      
      login: (user: User) => {
        set({ 
          user, 
          isAuthenticated: true,
          error: null 
        });
      },
      
      logout: () => {
        // Clear both localStorage and cookies on logout
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          document.cookie = 'access_token=; Max-Age=0; path=/;';
        }
        set({ 
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
        user: state.user,
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);