import axiosInstance from '../utils/axiosConfig';
import { User } from '../store/userStore';

export interface RegisterData {
  email: string;
  password: string;
  halachicCustom?: 'ashkenazi_EY' | 'ashkenazi_CL' | 'sephardi_ROY' | 'sephard_RME' | 'manual';
  location?: {
    city?: string;
    timezone?: string;
    geonameId?: number;
    lat?: number;
    lng?: number;
  };
  consents?: {
    dataProcessing?: {
      granted: boolean;
    };
  };
  halachicPreferences?: {
    ohrZaruah?: boolean;
    beinonit_24hr?: boolean;
    beinonit_31?: boolean;
    vesetHachodesh30thSkip29?: boolean;
    haflagahDualMode?: 'latest_only' | 'keep_both';
    minimumNiddahDays?: number;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface SessionResponse {
  authenticated: boolean;
  user: User | null;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyResetCodeData {
  email: string;
  code: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', data);
  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  await axiosInstance.post('/auth/logout');
};

/**
 * Get current session
 */
export const getSession = async (): Promise<SessionResponse> => {
  const response = await axiosInstance.get<SessionResponse>('/auth/session');
  return response.data;
};

/**
 * Change password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/change-password', {
    currentPassword,
    newPassword,
  });
  return response.data;
};

/**
 * Link Google account to current user
 */
export const linkGoogleAccount = async (googleId: string): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/link-google', {
    googleId,
  });
  return response.data;
};

export const forgotPassword = async (data: ForgotPasswordData): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/forgot-password', data);
  return response.data;
};

export const verifyResetCode = async (data: VerifyResetCodeData): Promise<{ message: string; resetToken: string }> => {
  const response = await axiosInstance.post('/auth/verify-reset-code', data);
  return response.data;
};

export const resetPassword = async (resetToken: string, newPassword: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post('/auth/reset-password', { resetToken, newPassword });
  return response.data;
};

export default {
  register,
  login,
  logout,
  getSession,
  changePassword,
  linkGoogleAccount,
  forgotPassword,
  verifyResetCode,
  resetPassword,
};
