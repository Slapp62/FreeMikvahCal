import axios from 'axios';
import { useUserStore } from '../store/userStore';
import { useCycleStore } from '../store/cycleStore';

// Get API base URL from environment or use default
// In production (Render), use relative path since Express serves frontend from same domain
// In development, use localhost with port
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // CRITICAL: Send session cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Track if we're currently handling a 401 to prevent multiple redirects
let isHandling401 = false;

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      const url = error.config?.url || '';

      // Handle session expiration (401 Unauthorized)
      if (status === 401) {
        // Don't handle 401s for login/register/session endpoints
        const isAuthEndpoint = url.includes('/auth/login') ||
                              url.includes('/auth/register') ||
                              url.includes('/auth/session');

        if (!isAuthEndpoint && !isHandling401) {
          isHandling401 = true;

          console.log('Session expired - logging out');

          // Clear all stores
          useUserStore.getState().clearUser();
          useCycleStore.getState().clearCycles();

          // Navigate to login using window.location
          window.location.href = '/login?session=expired';

          // Reset flag after a delay
          setTimeout(() => {
            isHandling401 = false;
          }, 1000);
        }
      }

      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', error.response.data);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('No response from server');
    } else {
      // Request setup error
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
