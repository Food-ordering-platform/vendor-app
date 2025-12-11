import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { AuthResponse } from '../types/auth.types'; // Import from shared types

interface AuthContextType {
  // ✅ Frontend Style: Infer type from the response instead of manual interface
  user: AuthResponse['user'] | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: AuthResponse['user'], token: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('user_data');
        const storedToken = await SecureStore.getItemAsync('auth_token');
        
        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch (e) {
        console.log('Failed to restore session');
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const setAuth = async (newUser: AuthResponse['user'], newToken: string) => {
    await SecureStore.setItemAsync('auth_token', newToken);
    await SecureStore.setItemAsync('user_data', JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isLoading, 
        setAuth, 
        logout,
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);