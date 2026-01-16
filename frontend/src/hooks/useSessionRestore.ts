import { useEffect } from 'react';
import { useUserStore } from '../store/userStore';
import { getSession } from '../services/authApi';

/**
 * Hook to restore user session on app mount
 * Runs only once when the app initializes
 */
export const useSessionRestore = () => {
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      // Use getState() to avoid creating subscriptions
      const { setLoading, setUser, clearUser } = useUserStore.getState();

      setLoading(true);

      try {
        const sessionData = await getSession();

        // Only update state if component is still mounted
        if (isMounted) {
          if (sessionData.authenticated && sessionData.user) {
            setUser(sessionData.user);
          } else {
            clearUser();
          }
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
        // Only update state if component is still mounted
        if (isMounted) {
          clearUser();
        }
      }
    };

    restoreSession();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []); // Empty deps - run only once on mount
};

export default useSessionRestore;
