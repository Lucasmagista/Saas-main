import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

interface OnboardingGuardProps {
  children: React.ReactNode;
}

/**
 * Componente que protege rotas verificando se o onboarding foi concluído
 */
export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const location = useLocation();

  // Aguardar carregamento da autenticação e onboarding
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated || !user) {
    console.log('OnboardingGuard: Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se precisar completar onboarding, redirecionar para página de onboarding
  if (needsOnboarding) {
    // Não redirecionar se já estiver na página de onboarding
    if (location.pathname === '/onboarding') {
      return <>{children}</>;
    }
    return <Navigate to="/onboarding" replace />;
  }

  // Usuário autenticado e onboarding completo
  return <>{children}</>;
};

interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para rotas públicas (login, registro)
 * Redireciona usuários autenticados para o dashboard ou onboarding
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboarding();

  // Aguardar carregamento
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se autenticado, redirecionar apropriadamente
  if (isAuthenticated) {
    if (needsOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // Não autenticado, mostrar conteúdo público
  return <>{children}</>;
};
