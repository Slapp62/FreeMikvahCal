import { useUserStore } from '../store/userStore';
import { getSession } from '../services/authApi';

/**
 * Lightweight hook for session checking without navigation dependency
 * Can be used outside Router context (e.g., in App.tsx before BrowserRouter mounts)
 *
 * For full auth functionality (login, logout, etc.) use useAuth hook instead
 */
export const useSessionCheck = () => {
  const setUser = useUserStore((state) => state.setUser);
  const clearUser = useUserStore((state) => state.clearUser);

  /**
   * Check if user has a valid session and sync with store
   * @returns Promise<boolean> - true if authenticated, false otherwise
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

  return { checkSession };
};
