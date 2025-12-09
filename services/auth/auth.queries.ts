import { useMutation } from '@tanstack/react-query';
import { authService } from './auth';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../../context/AuthContext'; 
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
      // If your API returns a token immediately on login:
      if (data.token) {
        await saveSession(data.token, data.user);
        setAuth(data.user);
      } else {
        // If 2FA is required, handle that flow here (e.g. navigate to Verify OTP)
        console.log("2FA required or no token returned");
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
      // Typically, after register, we send an OTP, so we don't login yet.
      // Just return success so the UI can navigate to OTP screen.
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
      // OTP verified -> Now we define the user as "Logged In"
      await saveSession(data.token, data.user);
      setAuth(data.user);
    },
    onError: (error: any) => {
      Alert.alert("Verification Failed", "Invalid or expired code.");
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