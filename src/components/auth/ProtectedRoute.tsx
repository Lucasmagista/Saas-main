
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log('ProtectedRoute - User:', user, 'Authenticated:', isAuthenticated, 'Loading:', loading);
    console.log('ProtectedRoute - Current Location:', location.pathname);
  }, [user, isAuthenticated, loading, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-3 text-sm text-gray-600">Verificando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('User not authenticated, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('User authenticated, rendering protected content for:', location.pathname);
  return <>{children}</>;
};
