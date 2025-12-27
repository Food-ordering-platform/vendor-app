// food-ordering-platform/vendor-app/vendor-app-work-branch/context/authContext.tsx

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { LoginData, RegisterData, User } from '../types/auth.types';
import { useCurrentUser, useLogin, useRegister } from '../services/auth/auth.queries';
import { Alert } from 'react-native';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // Exposed to force update user state
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  // 👇 1. Use the Query Hook for State Management
  const { data: user, isLoading: isUserLoading, refetch } = useCurrentUser();
  
  // 👇 2. Use Mutation Hooks
  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Helper to refresh user manually (e.g., after creating a restaurant)
  const refreshUser = async () => {
    await refetch();
  };

  const login = async (data: LoginData) => {
    try {
      const res = await loginMutation.mutateAsync(data);
      
      if (res.requireOtp) {
        // The component will handle the navigation to OTP screen
        return; 
      }

      if (res.token) {
        await AsyncStorage.setItem('token', res.token);
        // 👇 Immediately fetch user data after setting token
        await refetch(); 
      }
    } catch (error: any) {
      // Error is handled by the mutation or component
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const res = await registerMutation.mutateAsync(data);
      // Usually followed by OTP, so we don't set token yet
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    queryClient.setQueryData(['currentUser'], null); // Clear Cache
    queryClient.removeQueries({ queryKey: ['currentUser'] });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user: user || null, // Data from React Query
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