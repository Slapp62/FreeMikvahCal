import axiosInstance from './axiosConfig';
import { useUserStore } from '../store/userStore';
import { useCycleStore } from '../store/cycleStore';

let isHandlingExpiredSession = false;

/**
 * Handle expired or invalid session
 * Clears user state and redirects to login
 */
export const handleSessionExpired = () => {
  if (isHandlingExpiredSession) return;

  isHandlingExpiredSession = true;

  console.log('Session expired - logging out');

  // Clear Zustand state
  useUserStore.getState().clearUser();
  useCycleStore.getState().clearCycles();

  // Redirect to login
  if (window.location.pathname !== '/login') {
    window.location.href = '/login?session=expired';
  }

  setTimeout(() => {
    isHandlingExpiredSession = false;
  }, 1000);
};

/**
 * Check if user session is valid
 * Called on app mount
 */
export const checkSession = async (): Promise<boolean> => {
  try {
    const response = await axiosInstance.get('/auth/session');
    return response.data.authenticated === true;
  } catch (error) {
    console.error('Session check failed:', error);
    return false;
  }
};

/**
 * Setup axios interceptors for session management
 */
export const setupSessionInterceptors = () => {
  // Add response interceptor for 401 handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Check if this is a login/register/session request (don't handle as session expiry)
        const url = error.config?.url || '';
        if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/session')) {
          handleSessionExpired();
        }
      }
      return Promise.reject(error);
    }
  );
};

export default {
  handleSessionExpired,
  checkSession,
  setupSessionInterceptors,
};
