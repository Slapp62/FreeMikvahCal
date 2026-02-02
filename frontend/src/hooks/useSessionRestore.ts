import { useEffect, useState } from 'react';
import { useSessionCheck } from './useSessionCheck';

/**
 * Hook to restore user session on app initialization
 * Validates existing session cookie and syncs with Zustand store
 *
 * Uses useSessionCheck instead of useAuth to avoid Router context dependency
 */
export const useSessionRestore = () => {
  const [isRestoring, setIsRestoring] = useState(true);
  const { checkSession } = useSessionCheck();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        // Attempt to restore session from existing cookie
        await checkSession();
      } catch (error) {
        // Session invalid or doesn't exist - user will remain logged out
        console.error('Session restoration failed:', error);
      } finally {
        setIsRestoring(false);
      }
    };

    restoreSession();
  }, [checkSession]);

  return { isRestoring };
};
