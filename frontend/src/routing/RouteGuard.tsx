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

  // 'user' permission: redirect to login if not authenticated
  if (permission === 'user' && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 'non-user' permission: redirect to calendar if authenticated
  if (permission === 'non-user' && isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/calendar';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
