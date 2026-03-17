import React, { createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { LoginData, RegisterData, User, AuthResponse } from '../types/auth.types';
import { useCurrentUser, useLogin, useRegister } from '../services/auth/auth.queries';
import { tokenStorage } from '../utils/storage'; // 🟢 Import our clean storage utility

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
        if (res.token) {
           await tokenStorage.setItem('access_token', res.token);
        }
        return res; 
      }

      if (res.token && res.refreshToken) {
        // Save the tokens to the keychain
        await tokenStorage.setItem('access_token', res.token);
        await tokenStorage.setItem('refresh_token', res.refreshToken);
        
        // 🟢 Force a network fetch to populate 'currentUser' and trigger App.tsx
        await refetch();
      } else {
        console.error("Backend didn't send both tokens!", res);
      }
      return res;
    } catch (error: any) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const res = await registerMutation.mutateAsync(data);
      
      if (res.token && res.refreshToken) {
        await tokenStorage.setItem('access_token', res.token);
        await tokenStorage.setItem('refresh_token', res.refreshToken);
        await refetch();
      }
      return res;
    } catch (error: any) {
      throw error;
    }
  };

  const logout = async () => {
    // 🟢 Destroy both tokens on logout
    await tokenStorage.removeItem('access_token');
    await tokenStorage.removeItem('refresh_token');
    
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