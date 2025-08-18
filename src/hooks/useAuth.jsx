import { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { authService } from '@/services/authService';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    console.log('🔍 Verificando autenticação...');
    
    try {
      // Força reload dos tokens do localStorage
      authService.loadTokensFromStorage();
      
      // Verifica se tem tokens válidos
      if (authService.isAuthenticated()) {
        try {
          // Primeiro, verifica se há dados do usuário no localStorage
          const savedUser = authService.getUser();
          if (savedUser) {
            console.log('✅ Usuário encontrado no localStorage:', savedUser.email);
            setUser(savedUser);
            setProfile(savedUser);
            setIsAuthenticated(true);
            
            // Busca dados atualizados da API em background (não bloqueia UI)
            authService.getCurrentUser()
              .then(userData => {
                if (userData && userData.email === savedUser.email) {
                  console.log('✅ Dados do usuário atualizados da API');
                  setUser(userData);
                  setProfile(userData);
                  localStorage.setItem('user', JSON.stringify(userData));
                }
              })
              .catch(error => {
                console.warn('⚠️ Aviso: Erro ao buscar dados atualizados (usando dados salvos):', error.message);
                // Não faz logout aqui, apenas usa os dados salvos
              });
            
            return;
          }
          
          // Se não tem dados salvos, busca da API
          const userData = await authService.getCurrentUser();
          if (userData) {
            console.log('✅ Usuário autenticado via API:', userData.email);
            setUser(userData);
            setProfile(userData);
            setIsAuthenticated(true);
            return;
          }
        } catch (userError) {
          console.warn('❌ Erro ao buscar dados do usuário:', userError.message);
          
          // Se o erro for de token expirado, tenta renovar
          if (userError.message.includes('TOKEN_EXPIRED') || userError.message.includes('401')) {
            try {
              console.log('🔄 Tentando renovar tokens...');
              await authService.refreshTokens();
              
              // Tenta buscar dados novamente
              const userData = await authService.getCurrentUser();
              if (userData) {
                console.log('✅ Usuário autenticado após renovação:', userData.email);
                setUser(userData);
                setProfile(userData);
                setIsAuthenticated(true);
                return;
              }
            } catch (refreshError) {
              console.error('❌ Falha ao renovar tokens:', refreshError.message);
            }
          }
          
          // Se chegou até aqui, deu erro mesmo - faz logout
          await authService.logout();
        }
      }
      
      // Se chegou até aqui, não está autenticado
      console.log('❌ Usuário não autenticado');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
    } catch (error) {
      console.error('❌ Erro na verificação de autenticação:', error);
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    console.log('🔑 Tentando fazer login para:', email);
    
    try {
      setLoading(true);
      
      const result = await authService.login(email, password);
      
      if (result.user) {
        console.log('✅ Login realizado com sucesso');
        setUser(result.user);
        setProfile(result.user);
        setIsAuthenticated(true);
        
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo, ${result.user.full_name || result.user.email}!`,
        });
        
        return { success: true, user: result.user };
      } else {
        throw new Error('Falha na autenticação');
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      toast({
        title: "Erro no login",
        description: error.message || "Credenciais inválidas",
        variant: "destructive",
      });
      
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 Fazendo logout...');
    
    try {
      await authService.logout();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  const logoutAllDevices = async () => {
    console.log('🚪 Fazendo logout de todos os dispositivos...');
    
    try {
      await authService.logoutAllDevices();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado de todos os dispositivos.",
      });
    } catch (error) {
      console.error('❌ Erro no logout geral:', error);
      toast({
        title: "Erro no logout",
        description: error.message || "Erro ao desconectar de todos os dispositivos.",
        variant: "destructive",
      });
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
};

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
