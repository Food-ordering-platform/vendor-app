import api from '../axios'; // Your axios instance from services/api.ts
import { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  VerifyOtpPayload, 
  VerifyOtpResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  VerifyResetOtpPayload,
  VerifyResetOtpResponse,
  ResetPasswordPayload,
  ResetPasswordResponse
} from '../../types/auth.types';

export const authService = {
  // 1. Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { ...data, role: 'VENDOR' });
    return response.data;
  },

  // 2. Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', { ...data, role: 'VENDOR' });
    return response.data;
  },

  // 3. Verify OTP (For Email Verification)
  verifyOtp: async (data: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  // 4. Forgot Password (Request OTP)
  forgotPassword: async (data: ForgotPasswordPayload): Promise<ForgotPasswordResponse> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  // 5. Verify Reset OTP (Check if code is valid)
  verifyResetOtp: async (data: VerifyResetOtpPayload): Promise<VerifyResetOtpResponse> => {
    const response = await api.post('/auth/verify-reset-otp', data);
    return response.data;
  },

  // 6. Reset Password (Set new password)
  resetPassword: async (data: ResetPasswordPayload): Promise<ResetPasswordResponse> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  }
};