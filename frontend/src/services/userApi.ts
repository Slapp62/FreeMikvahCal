import axiosInstance from '../utils/axiosConfig';
import { User } from '../store/userStore';

export interface HalachicPreferences {
  ohrZaruah?: boolean;
  kreisiUpleisi?: boolean;
  chasamSofer?: boolean;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  location?: {
    city?: string;
    timezone?: string;
    lat?: number;
    lng?: number;
  };
  ethnicity?: 'ashkenazi' | 'sephardi' | 'teimani' | 'other' | null;
  halachicPreferences?: HalachicPreferences;
}

export interface Preferences {
  hebrewCalendar: boolean;
  defaultCycleLength: number;
  notifications: {
    enabled: boolean;
    hefsekTaharaReminder: boolean;
    shivaNekiyimReminder: boolean;
    mikvahReminder: boolean;
    vestOnotReminder: boolean;
    reminderTime: string;
  };
  privacyMode: boolean;
  language: 'he' | 'en';
  dataRetention: {
    keepCycles: number;
    autoDelete: boolean;
  };
}

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/users/me');
  return response.data;
};

/**
 * Update current user
 */
export const updateCurrentUser = async (data: UpdateUserData): Promise<{ message: string; user: User }> => {
  const response = await axiosInstance.put('/users/me', data);
  return response.data;
};

/**
 * Delete account
 */
export const deleteAccount = async (): Promise<{ message: string }> => {
  const response = await axiosInstance.delete('/users/me');
  return response.data;
};

/**
 * Get user preferences
 */
export const getPreferences = async (): Promise<Preferences> => {
  const response = await axiosInstance.get<Preferences>('/users/preferences');
  return response.data;
};

/**
 * Update user preferences
 */
export const updatePreferences = async (data: Partial<Preferences>): Promise<{ message: string; preferences: Preferences }> => {
  const response = await axiosInstance.put('/users/preferences', data);
  return response.data;
};

/**
 * Complete onboarding
 */
export const completeOnboarding = async (): Promise<{ message: string; user: User }> => {
  const response = await axiosInstance.post('/users/complete-onboarding');
  return response.data;
};

export default {
  getCurrentUser,
  updateCurrentUser,
  deleteAccount,
  getPreferences,
  updatePreferences,
  completeOnboarding,
};
