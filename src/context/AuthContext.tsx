import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { loginToServer, refreshServerSession, logoutFromServer } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithToken: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuthSession = async () => {
      try {
        const data = await refreshServerSession();
        if (data && data.user) {
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuthSession();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const loginWithToken = async (idToken: string) => {
    try {
      setIsLoading(true);
      const data = await loginToServer(idToken);
      if (data && data.user) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
      throw new Error('No fue posible autenticar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await logoutFromServer();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
