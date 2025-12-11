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
  if (!token) return; // Prevent saving null/undefined
  await SecureStore.setItemAsync('auth_token', token);
  await SecureStore.setItemAsync('user_data', JSON.stringify(user));
};

export const useLogin = () => {
  const { setAuth } = useAuth();

  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      // Check if login requires OTP first
      if (data.requireOtp) {
         // UI handles redirection, we don't save session yet
         return; 
      }
      
      if (data.token) {
        await saveSession(data.token, data.user);
        await setAuth(data.user, data.token);
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Login failed";
      Alert.alert("Login Failed", msg);
    },
  });
};

export const useRegister = () => {
  return useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: authService.register,
    // No onSuccess alert needed, UI handles navigation
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Registration failed";
      Alert.alert("Registration Failed", msg);
    },
  });
};

export const useVerifyOtp = () => {
  const { setAuth } = useAuth();

  return useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
    mutationFn: authService.verifyOtp,
    onSuccess: async (data) => {
      // [FIX] Defensive check. Backend MUST return a token now.
      if (!data.token) {
        Alert.alert("Error", "Verified, but server sent no token. Please login.");
        return;
      }
      await saveSession(data.token, data.user);
      await setAuth(data.user, data.token);
    },
    onError: (error: any) => {
      // User Friendly Error Handling
      let msg = error?.response?.data?.message || error.message || "Verification Failed";
      
      // Catch specific backend error strings and make them nicer if needed
      if (msg.includes("jwt expired")) msg = "Your code has expired. Please login again.";
      if (msg.includes("malformed")) msg = "Invalid code format.";
      
      Alert.alert("Verification Failed", msg);
    }
  });
};

// ... keep useForgotPassword and useResetPassword as is
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