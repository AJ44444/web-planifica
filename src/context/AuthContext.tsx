import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

const TOKEN_STORAGE_KEY = 'google_id_token';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithToken: (idToken: string, userPayload?: Partial<User>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): any {
  try {
    const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
    return base64 ? JSON.parse(window.atob(base64)) : null;
  } catch {
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Read session strictly from sessionStorage as per requirements
    const savedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (savedToken) {
      setToken(savedToken);
      const decoded = parseJwt(savedToken);
      if (decoded && decoded.sub) {
        setUser({
          google_id: decoded.sub,
          name: decoded.name || decoded.email || 'Usuario',
          email: decoded.email || '',
          picture: decoded.picture,
        });
      } else {
        const storedUser = sessionStorage.getItem('user_profile_cache');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser(null);
          }
        }
      }
    }
    setIsLoading(false);
  }, []);

  const loginWithToken = (idToken: string, userPayload?: Partial<User>) => {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, idToken);
    setToken(idToken);

    const decoded = parseJwt(idToken);
    const userInfo: User = {
      google_id: userPayload?.google_id || decoded?.sub || '',
      name: userPayload?.name || decoded?.name || decoded?.email || 'Usuario',
      email: userPayload?.email || decoded?.email || '',
      picture: userPayload?.picture || decoded?.picture,
    };

    setUser(userInfo);
    sessionStorage.setItem('user_profile_cache', JSON.stringify(userInfo));
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem('user_profile_cache');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
