import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  user_id: string;
  name: string;
  phone_number: string;
}

export const setToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const getToken = (): string | null => {
  return localStorage.getItem('access_token');
};

export const removeToken = (): void => {
  localStorage.removeItem('access_token');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const getUserFromToken = (token: string): User | null => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return {
      user_id: decoded.user_id,
      name: decoded.name,
      phone_number: decoded.phone_number,
    };
  } catch {
    return null;
  }
};

export interface User {
  user_id: string;
  name: string;
  phone_number: string;
}
export const setTokenCookie = (token: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `access_token=${token};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const getTokenFromCookie = (cookieString: string | null): string | null => {
  if (!cookieString) return null;
  
  const cookieArray = cookieString.split(';');
  for (const cookie of cookieArray) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'access_token') {
      return value || null;
    }
  }
  return null;
};

export const removeTokenCookie = (): void => {
  document.cookie = 'access_token=; Max-Age=0; path=/;';
};