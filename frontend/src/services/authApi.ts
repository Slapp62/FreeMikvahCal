import axiosInstance from '../utils/axiosConfig';
import { User } from '../store/userStore';

export interface RegisterData {
  email: string;
  password: string;
  halachicCustom?: 'ashkenazi' | 'sephardi' | 'chabad' | 'manual';
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
    kreisiUpleisi?: boolean;
    chasamSofer?: boolean;
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

export default {
  register,
  login,
  logout,
  getSession,
  changePassword,
  linkGoogleAccount,
};
