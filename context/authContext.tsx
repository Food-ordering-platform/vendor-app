// food-ordering-platform/vendor-app/vendor-app-work-branch/context/authContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store'; // CHANGED: Use SecureStore
import { useQueryClient } from '@tanstack/react-query';
import { LoginData, RegisterData, User, AuthResponse } from '../types/auth.types';
import { useCurrentUser, useLogin, useRegister } from '../services/auth/auth.queries';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>; // Changed return type
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: user, isLoading: isUserLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const refreshUser = async () => {
    await refetch();
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      const res = await loginMutation.mutateAsync(data);
      
      if (res.requireOtp) {
        // Return immediately; don't set token yet
        return res; 
      }

      if (res.token) {
        // CHANGED: Use SecureStore and key 'auth_token'
        await SecureStore.setItemAsync('auth_token', res.token);
        await refetch(); // Fetch user data immediately
      }
      return res;
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const res = await registerMutation.mutateAsync(data);
      // Register usually returns a temp token for OTP, but we don't auto-login yet
      return res;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    // CHANGED: Use SecureStore
    await SecureStore.deleteItemAsync('auth_token');
    queryClient.setQueryData(['currentUser'], null);
    queryClient.removeQueries({ queryKey: ['currentUser'] });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: user || null, 
        isLoading: isUserLoading, 
        login, 
        register, 
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};