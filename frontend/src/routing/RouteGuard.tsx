import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../store/userStore';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireNoAuth?: boolean; // For login/register pages
}

const RouteGuard = ({
  children,
  requireAuth = true,
  requireNoAuth = false,
}: RouteGuardProps) => {
  const location = useLocation();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const isLoading = useUserStore((state) => state.isLoading);

  // Show loader while checking authentication
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to home if user is authenticated but trying to access login/register
  if (requireNoAuth && isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || '/calendar';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
