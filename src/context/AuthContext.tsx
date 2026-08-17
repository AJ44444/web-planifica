import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import type { User } from '../types';

const TOKEN_COOKIE_NAME = 'google_id_token';

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
    // Read session strictly from cookies as per requirements
    const savedToken = Cookies.get(TOKEN_COOKIE_NAME);
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
        // Fallback for non-JWT cookie tokens
        const storedUser = Cookies.get('user_profile_cache');
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
    // Strict Cookie Storage per specification
    Cookies.set(TOKEN_COOKIE_NAME, idToken, { 
      expires: 1, // 1 day
      sameSite: 'strict',
      secure: window.location.protocol === 'https:'
    });

    setToken(idToken);

    const decoded = parseJwt(idToken);
    const userInfo: User = {
      google_id: userPayload?.google_id || decoded?.sub || '',
      name: userPayload?.name || decoded?.name || decoded?.email || 'Usuario',
      email: userPayload?.email || decoded?.email || '',
      picture: userPayload?.picture || decoded?.picture,
    };

    setUser(userInfo);
    Cookies.set('user_profile_cache', JSON.stringify(userInfo), { expires: 1, sameSite: 'strict' });
  };

  const logout = () => {
    Cookies.remove(TOKEN_COOKIE_NAME);
    Cookies.remove('user_profile_cache');
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
