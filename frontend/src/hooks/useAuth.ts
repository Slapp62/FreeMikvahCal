import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useCycleStore } from '../store/cycleStore';
import { login as loginApi, register as registerApi, logout as logoutApi, getSession } from '../services/authApi';
import { notifications } from '@mantine/notifications';
import type { LoginData, RegisterData } from '../services/authApi';

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

      navigate('/calendar');
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
      setUser(response.user);

      notifications.show({
        title: 'Welcome to FreeMikvahCal!',
        message: 'Your account has been created successfully',
        color: 'green',
      });

      navigate('/calendar');
      return { success: true };
    } catch (error: any) {
      console.error('Registration error:', error);

      const message = error.response?.data?.message || error.message || 'Please check your information and try again';

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
    logout,
    checkSession,
    isLoading,
  };
};
