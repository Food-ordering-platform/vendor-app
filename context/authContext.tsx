import React, { createContext, useContext, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store'; 
import { Platform } from 'react-native'; // 👈 Import Platform
import { useQueryClient } from '@tanstack/react-query';
import { LoginData, RegisterData, User, AuthResponse } from '../types/auth.types';
import { useCurrentUser, useLogin, useRegister } from '../services/auth/auth.queries';

interface AuthContextType {
  user: User | null;
  restaurant: any | null; 
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 👇 HELPER FUNCTIONS FOR STORAGE
const saveToken = async (token: string) => {
  if (Platform.OS === 'web') {
    localStorage.setItem('auth_token', token);
  } else {
    await SecureStore.setItemAsync('auth_token', token);
  }
};

const deleteToken = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('auth_token');
  } else {
    await SecureStore.deleteItemAsync('auth_token');
  }
};

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
        return res; 
      }

      if (res.token) {
        // 👇 USE HELPER FUNCTION (Safe for Web)
        await saveToken(res.token);
        
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
    // 👇 USE HELPER FUNCTION
    await deleteToken();
    queryClient.setQueryData(['currentUser'], null);
    queryClient.removeQueries({ queryKey: ['currentUser'] });
  };

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