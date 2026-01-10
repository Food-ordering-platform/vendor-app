import React, { createContext, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store'; 
import { useQueryClient } from '@tanstack/react-query';
import { LoginData, RegisterData, User, AuthResponse } from '../types/auth.types';
import { useCurrentUser, useLogin, useRegister } from '../services/auth/auth.queries';

interface AuthContextType {
  user: User | null;
  restaurant: any | null; // Helper to access restaurant quickly
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // 1. Fetch User (includes 'restaurant' object from backend)
  const { data: user, isLoading: isUserLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const refreshUser = async () => {
    await refetch();
  };

  const login = async (data: LoginData): Promise<AuthResponse> => {
    try {
      const res = await loginMutation.mutateAsync(data);
      
      // If OTP is required, we don't set the token yet
      if (res.requireOtp) {
        return res; 
      }

      // If valid token, save and force user fetch
      if (res.token) {
        await SecureStore.setItemAsync('auth_token', res.token);
        
        // [CRITICAL] Wait for the user data to be fetched before returning
        // This ensures 'isAuthenticated' becomes true immediately
        await refetch(); 
      }
      return res;
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      return await registerMutation.mutateAsync(data);
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('auth_token');
    queryClient.setQueryData(['currentUser'], null);
    queryClient.removeQueries({ queryKey: ['currentUser'] });
  };

  // 2. Derived State
  const isAuthenticated = !!user; 
  const restaurant = user?.restaurant || null;

  return (
    <AuthContext.Provider 
      value={{ 
        user: user || null, 
        restaurant,
        isAuthenticated, 
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