
//-----------DATA OR REQUEST SENT TO THE BACKEND (REQUEST PAYLOADS)-----------//

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string; // Phone is usually mandatory for vendors
  role: "VENDOR"; // Strict typing for this app
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  token: string; // The temp token received after login/signup
  code: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyResetOtpPayload {
  token: string;
  code: string;
}


//-----------DATA RECEIVED FROM THE BACKEND (RESPONSE TYPES)-----------//

export interface AuthResponse {
  token: string;
  requireOtp?: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "VENDOR";
    restaurant?: {
      id: string;
      name: string;
      address: string;
      phone: string;
      email: string;
      prepTime: number;
      minimumOrder: number;
      isOpen: boolean;
      imageUrl?: string;
      ownerId: string;
    } | null;
  };
  };


export interface VerifyOtpResponse {
  message: string;
  user: {
    id: string;
    email: string;
    role: "VENDOR";
  };
  token: string; // Final auth token
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