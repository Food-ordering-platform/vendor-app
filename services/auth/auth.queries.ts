import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from './auth';
import { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  VerifyOtpPayload, 
  VerifyOtpResponse, 
  VerifyResetOtpPayload,
  VerifyResetOtpResponse,
  WebPushSubscriptionPayload
} from '../../types/auth.types';
import { toast } from '../../components/ui/Toast'; // 👈 Import Toast

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    retry: false, 
    staleTime: 1000 * 60 * 5,
  });
};

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginData>({
    mutationFn: authService.login,
    onSuccess: (data) => {
        // Optional: toast.success("Welcome back!");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Login failed";
      toast.error(msg);
    },
  });
};

export const useRegister = () => {
  return useMutation<AuthResponse, Error, RegisterData>({
    mutationFn: authService.register,
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Registration failed";
      toast.error(msg);
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
    mutationFn: authService.verifyOtp,
    onSuccess: (data) => {
      if (!data.token) {
        toast.success("Verified! Please login.");
      } else {
        toast.success("Verification successful");
      }
    },
    onError: (error: any) => {
      let msg = error?.response?.data?.message || error.message || "Verification Failed";
      if (msg.includes("jwt expired")) msg = "Code expired. Please login again.";
      if (msg.includes("malformed")) msg = "Invalid code format.";
      
      toast.error(msg);
    }
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success("Reset code sent to your email");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Could not send email");
    }
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success("Password reset! You can now login.");
    },
    onError: (error: any) => {
      toast.error("Failed to reset password");
    }
  });
};

export const useVerifyResetOtp = () => {
  return useMutation<VerifyResetOtpResponse, Error, VerifyResetOtpPayload>({
    mutationFn: authService.verifyResetOtp,
    onSuccess: () => {
        toast.success("Code verified");
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Invalid or expired code";
      toast.error(msg);
    }
  });
};

export const useSubscribeToWebPush = () => {
  return useMutation({
    mutationFn: (subscription: WebPushSubscriptionPayload) =>
      authService.subscribeToWebPush(subscription),
    onError: (error) => {
      console.error("Failed to sync web push subscription:", error);
    },
  });
};