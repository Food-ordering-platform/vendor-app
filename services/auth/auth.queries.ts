import { useMutation } from '@tanstack/react-query';
import { authService } from './auth';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/authContext'; 
import { Alert } from 'react-native';
import { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  VerifyOtpPayload, 
  VerifyOtpResponse 
} from '../../types/auth.types';

// Helper to save session
const saveSession = async (token: string, user: any) => {
  await SecureStore.setItemAsync('auth_token', token);
  await SecureStore.setItemAsync('user_data', JSON.stringify(user));
};

export const useLogin = () => {
  const { setAuth } = useAuth();

  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      if (data.token) {
        await saveSession(data.token, data.user);
        await setAuth(data.user, data.token); // [FIX] Pass both user and token
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Login failed";
      Alert.alert("Error", msg);
    },
  });
};

export const useRegister = () => {
  return useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: authService.register,
    onSuccess: (data) => {
      Alert.alert("Success", "Account created! Please check your email for OTP.");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Registration failed";
      Alert.alert("Error", msg);
    },
  });
};

export const useVerifyOtp = () => {
  const { setAuth } = useAuth();

  return useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
    mutationFn: authService.verifyOtp,
    onSuccess: async (data) => {
      // [FIX] Correctly pass both arguments to setAuth
      await saveSession(data.token, data.user);
      await setAuth(data.user, data.token);
    },
    onError: (error: any) => {
      const msg = error.message || error?.response?.data?.message || "Verification Failed";
      Alert.alert("Verification Failed", msg);
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      Alert.alert("Email Sent", "Check your inbox for the reset code.");
    },
    onError: (error: any) => {
      Alert.alert("Error", error?.response?.data?.message || "Could not send email.");
    }
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      Alert.alert("Success", "Password reset successfully! Login with your new password.");
    },
    onError: (error: any) => {
      Alert.alert("Error", "Failed to reset password.");
    }
  });
};