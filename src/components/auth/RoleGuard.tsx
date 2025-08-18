import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * RoleGuard wraps protected pages and ensures that the current user has a
 * permitted role. If no roles are supplied, access is granted by default.
 * When a user is not authorised, the component redirects to the
 * `/unauthorized` page. This ensures that direct navigation to restricted
 * routes does not expose sensitive pages.
 */
interface RoleGuardProps {
  allowedRoles?: string[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { profile, loading, user } = useAuth();
  let userRole = profile?.position?.toLowerCase();
  // Normaliza para tratar 'super admin' e 'super_admin' como 'admin'
  if (userRole === 'super admin' || userRole === 'super_admin') {
    userRole = 'admin';
  }

  if (loading) {
    // Optionally show a spinner here
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  // TEMPORÁRIO: Para lucas.magista1@gmail.com, permitir acesso a tudo
  if (user?.email === 'lucas.magista1@gmail.com') {
    return <>{children}</>;
  }

  // If no roles are specified, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // If roles are specified and userRole is defined, verify access
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If user doesn't have a role but roles are required, redirect to unauthorized
  if (allowedRoles && !userRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};