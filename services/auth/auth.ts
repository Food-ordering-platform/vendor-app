import api from "../axios"; // Your axios instance from services/api.ts
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
  ResetPasswordResponse,
} from "../../types/auth.types";

export const authService = {
  // 1. Login
  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      // FORCE clientType to 'mobile'
      const payload = { ...data, clientType: "mobile" as const };

      const response = await api.post("/auth/login", payload);
      const { result, token, user } = response.data;

      // Mobile expects a token.
      // The backend might nest it in 'result' or return it directly.
      // Based on your controller, it sends { token, user } or { result: { token, user } }
      // Let's handle both cases to be safe:
      const finalToken = token || result?.token;
      const finalUser = user || result?.user;

      if (!finalToken) {
        throw new Error("No access token received");
      }

      return {
        token: finalToken,
        user: finalUser,
      };
    } catch (error: any) {
      console.log("Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  // 2. Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data; // return only the data
    } catch (error: any) {
      console.error("Register error:", error.response?.data || error.message);
      throw error;
    }
  },

  // 3. Verify OTP (For Email Verification)
  verifyOtp: async (data: VerifyOtpPayload): Promise<VerifyOtpResponse> => {
   try {
    // FORCE clientType to 'mobile'
    const payload = { ...data, clientType: "mobile" as const };
    
    const response = await api.post("/auth/verify-otp", payload);
    return response.data;
  } catch (error: any) {
    throw error;
  }
  },

  // 4. Forgot Password (Request OTP)
  forgotPassword: async (
    data: ForgotPasswordPayload
  ): Promise<ForgotPasswordResponse> => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  // 5. Verify Reset OTP (Check if code is valid)
  verifyResetOtp: async (
    data: VerifyResetOtpPayload
  ): Promise<VerifyResetOtpResponse> => {
    const response = await api.post("/auth/verify-reset-otp", data);
    return response.data;
  },

  // 6. Reset Password (Set new password)
  resetPassword: async (
    data: ResetPasswordPayload
  ): Promise<ResetPasswordResponse> => {
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },
};
