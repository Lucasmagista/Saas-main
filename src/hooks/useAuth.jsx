import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const token = authService.getAccessToken();
      
      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setProfile(null);
        return;
      }

      // Verifica se o token é válido
      if (authService.isTokenExpired(token)) {
        console.log('Token expirado, tentando renovar...');
        await authService.refreshTokens();
      }

      // Busca dados do usuário
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);

      // Busca perfil do usuário
      try {
        const profileData = await authService.getUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.warn('Erro ao buscar perfil:', error);
        setProfile(null);
      }

    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setIsAuthenticated(false);
      setUser(null);
      setProfile(null);
      authService.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Busca perfil do usuário
      try {
        const profileData = await authService.getUserProfile();
        setProfile(profileData);
      } catch (error) {
        console.warn('Erro ao buscar perfil:', error);
        setProfile(null);
      }

      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Erro no logout:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      authService.clearTokens();
    }
  };

  const logoutAllDevices = async () => {
    try {
      await authService.logoutAllDevices();
    } catch (error) {
      console.warn('Erro no logout geral:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      authService.clearTokens();
    }
  };

  const refreshAuth = async () => {
    console.log('🔄 Renovando autenticação...');
    await checkAuth();
  };

  // Verificar autenticação ao montar o componente
  useEffect(() => {
    checkAuth();
  }, []);

  // Verificar tokens expirados periodicamente
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(async () => {
        try {
          // Verifica se o token vai expirar em breve
          if (authService.tokenWillExpireSoon()) {
            console.log('🔄 Token expirando em breve, renovando...');
            await authService.refreshTokens();
          }
        } catch (error) {
          console.warn('Erro ao verificar/renovar token:', error);
          // Se deu erro, faz logout
          await logout();
        }
      }, 5 * 60 * 1000); // 5 minutos

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const contextValue = useMemo(() => ({
    user,
    profile,
    isAuthenticated,
    loading,
    login,
    logout,
    logoutAllDevices,
    refreshAuth
  }), [user, profile, isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para fazer requisições autenticadas
 */
export function useAuthRequest() {
  const { logout } = useAuth();

  const makeRequest = async (endpoint, method = 'GET', body = null) => {
    try {
      return await authService.makeAuthenticatedRequest(endpoint, method, body);
    } catch (error) {
      // Se erro de autenticação, faz logout automático
      if (error.message.includes('não autenticado') || 
          error.message.includes('Token inválido')) {
        await logout();
      }
      throw error;
    }
  };

  return { makeRequest };
}

/**
 * Componente para rotas protegidas
 */
export function ProtectedRoute({ children, fallback = null }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redireciona para login ou mostra fallback
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
      return null;
    }
    return fallback;
  }

  return children;
}

export default useAuth;