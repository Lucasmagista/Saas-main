
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - User:', user, 'Session:', session, 'Loading:', loading);
  }, [user, session, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !session) {
    console.log('No user or session, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
