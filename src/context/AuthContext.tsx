import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, AuthContextType } from '../types';
import { loginToServer, verifyServerSession, logoutFromServer } from '../services/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const initAuthSession = async () => {
      try {
        const data = await verifyServerSession();
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
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

    const handleRefreshStart = () => {
      setIsRefreshing(true);
    };

    const handleRefreshEnd = () => {
      setIsRefreshing(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:refresh-start', handleRefreshStart);
    window.addEventListener('auth:refresh-end', handleRefreshEnd);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:refresh-start', handleRefreshStart);
      window.removeEventListener('auth:refresh-end', handleRefreshEnd);
    };
  }, []);

  const loginWithToken = async (idToken: string) => {
    try {
      const data = await loginToServer(idToken);
      if (data && data.user) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
      throw new Error('No fue posible autenticar con el servidor.');
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
        isRefreshing,
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
