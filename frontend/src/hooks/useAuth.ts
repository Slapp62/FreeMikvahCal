import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useCycleStore } from '../store/cycleStore';
import { login as loginApi, register as registerApi, logout as logoutApi, getSession } from '../services/authApi';
import { notifications } from '@mantine/notifications';
import type { LoginData, RegisterData } from '../services/authApi';
import axiosInstance from '../utils/axiosConfig';

/**
 * Custom hook for authentication operations
 * Provides clean interface for login, register, logout, and session management
 */
export const useAuth = () => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);
  const clearCycles = useCycleStore((state) => state.clearCycles);

  const [isLoading, setIsLoading] = useState(false);

  /**
   * Login user
   */
  const login = async (credentials: LoginData) => {
    setIsLoading(true);
    try {
      const response = await loginApi(credentials);
      setUser(response.user);

      notifications.show({
        title: 'Welcome back!',
        message: 'You have successfully logged in',
        color: 'green',
      });

      // Check if user needs to complete their profile
      if (!response.user.profileComplete) {
        navigate('/complete-profile');
      } else {
        navigate('/calendar');
      }

      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);

      const message = error.response?.data?.message || error.message || 'Please check your credentials and try again';

      notifications.show({
        title: 'Login failed',
        message,
        color: 'red',
      });

      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const response = await registerApi(data);

      return { success: true, data: response }; 
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';

      notifications.show({
        title: 'Registration failed',
        message,
        color: 'red',
      });

      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (data: RegisterData) => {
    try {
    // Use an 'updateProfile' service call instead of 'registerAuth'
    const response = await axiosInstance.patch('/auth/complete-profile', {
      location: {
        city: data.location?.city,
        geonameId: data.location?.geonameId,
        lat: data.location?.lat,
        lng: data.location?.lng,
        timezone: data.location?.timezone || 'UTC',
      },
      halachicPreferences: data.halachicPreferences,
      halachicCustom: data.halachicCustom,
    });

    // Update your local state with the full user object
    setUser(response.data.user);

    notifications.show({
      title: 'Profile completed',
      message: 'You have successfully completed your profile',
      color: 'blue',
    });

    // Use replace to force navigation and avoid route guard issues
    navigate('/calendar', { replace: true });
  } catch (error) {
    notifications.show({ title: 'Error', message: 'Failed to save profile', color: 'red' });
  }
  }
  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }

    // Always clear local state
    clearUser();
    clearCycles();
    navigate('/');

    notifications.show({
      title: 'Logged out',
      message: 'You have been successfully logged out',
      color: 'blue',
    });
  };

  /**
   * Check current session validity
   * Returns true if session is valid, false otherwise
   */
  const checkSession = async (): Promise<boolean> => {
    try {
      const sessionData = await getSession();

      if (sessionData.authenticated && sessionData.user) {
        setUser(sessionData.user);
        return true;
      } else {
        clearUser();
        return false;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      clearUser();
      return false;
    }
  };

  return {
    login,
    register,
    completeProfile,
    logout,
    checkSession,
    isLoading,
  };
};
