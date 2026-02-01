
//-----------DATA OR REQUEST SENT TO THE BACKEND (REQUEST PAYLOADS)-----------//

import { Restaurant } from "./restaurant.types";

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string; // Phone is usually mandatory for vendors
  role: "VENDOR"; // Strict typing for this app
  terms: boolean
  restaurantName: string;
}

export interface LoginData {
  email: string;
  password: string;
  clientType?: "web" | "mobile"; // <--- ADDED 
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
  clientType?: "web" | "mobile"; // <--- ADDED
}
export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  email: string;
  code: string;
}

export interface WebPushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

//-----------DATA RECEIVED FROM THE BACKEND (RESPONSE TYPES)-----------//


export interface AuthResponse {
  user: User;
  token: string;
  requireOtp?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  restaurant?: Restaurant | null; 
}


export interface VerifyOtpResponse {
  success:boolean
  message: string;
  data: {
    isVerified: boolean
  } 
}


export interface ForgotPasswordResponse {
  message: string;
  token: string; // Temporary reset token
}


export interface VerifyResetOtpResponse {
  message: string;
  resetToken: string; // Token authorized to reset password
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}