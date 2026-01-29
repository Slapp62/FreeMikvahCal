import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

type Permission = 'user' | 'non-user';

interface RouteGuardProps {
  children: ReactNode;
  permission: Permission;
}

const RouteGuard = ({ children, permission }: RouteGuardProps) => {
  const location = useLocation();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);

  // 'user' permission: redirect to login if not authenticated
  if (permission === 'user' && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 'user' permission: redirect to complete-profile if authenticated but profile incomplete
  if (permission === 'user' && isAuthenticated && user && !user.profileComplete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // 'non-user' permission: redirect based on profile completion status
  if (permission === 'non-user' && isAuthenticated) {
    // If profile is incomplete, redirect to complete-profile
    if (user && !user.profileComplete) {
      return <Navigate to="/complete-profile" replace />;
    }
    // If profile is complete, redirect to calendar
    const from = (location.state as any)?.from?.pathname || '/calendar';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
