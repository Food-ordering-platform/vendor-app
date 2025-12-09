import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  setAuth: (user: User) => void; // Helper to update state manually
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as any);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userData = await SecureStore.getItemAsync('user_data');
        const token = await SecureStore.getItemAsync('auth_token');
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.log('Failed to restore session');
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const setAuth = (newUser: User) => {
    setUser(newUser);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('user_data');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);