// Serviço de autenticação para o frontend
class AuthService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
    
    // Carrega tokens do localStorage de forma segura
    this.loadTokensFromStorage();
    
    // Intercepta requisições para adicionar token automaticamente
    this.setupAxiosInterceptors();
  }

  /**
   * Carrega tokens do localStorage
   */
  loadTokensFromStorage() {
    if (typeof window !== 'undefined') {
      this.accessToken = localStorage.getItem('accessToken');
      this.refreshToken = localStorage.getItem('refreshToken');
      
      console.log('🔄 Tokens carregados do localStorage:', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken
      });
    } else {
      this.accessToken = null;
      this.refreshToken = null;
    }
  }

  /**
   * Configura interceptors do Axios para renovação automática de tokens
   */
  setupAxiosInterceptors() {
    // Interceptor para adicionar token nas requisições
    if (typeof window !== 'undefined' && window.axios) {
      window.axios.interceptors.request.use(
        (config) => {
          if (this.accessToken) {
            config.headers.Authorization = `Bearer ${this.accessToken}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Interceptor para renovar token automaticamente
      window.axios.interceptors.response.use(
        (response) => response,
        async (error) => {
          if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED') {
            try {
              const newTokens = await this.refreshTokens();
              
              // Tenta a requisição novamente com o novo token
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return window.axios.request(originalRequest);
            } catch (refreshError) {
              // Se falhou ao renovar, redireciona para login
              this.logout();
              window.location.href = '/login';
              return Promise.reject(refreshError);
            }
          }
          return Promise.reject(error);
        }
      );
    }
  }

  /**
   * Faz login do usuário
   */
  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no login');
      }

      // Salva os tokens
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Registra novo usuário
   */
  async register(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro no registro');
      }

      // Se retornou tokens, salva automaticamente
      if (data.accessToken) {
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Renova os tokens usando refresh token
   */
  async refreshTokens() {
    if (!this.refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao renovar tokens');
      }

      // Atualiza os tokens
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      // Se falhou ao renovar, limpa tokens
      this.logout();
      throw new Error(error.message);
    }
  }

  /**
   * Faz logout do usuário
   */
  async logout() {
    try {
      if (this.refreshToken) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error.message);
    } finally {
      // Limpa dados locais
      this.accessToken = null;
      this.refreshToken = null;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  /**
   * Faz logout de todos os dispositivos
   */
  async logoutAllDevices() {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/logout-all', 'POST');
      
      // Limpa dados locais
      this.accessToken = null;
      this.refreshToken = null;
      
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      return response;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  /**
   * Busca dados do usuário atual
   */
  async getCurrentUser() {
    try {
      console.log('🔍 Buscando dados do usuário atual...');
      const response = await this.makeAuthenticatedRequest('/auth/me');
      
      if (response && response.success && response.data) {
        console.log('✅ Dados do usuário obtidos:', response.data.email);
        
        // Atualiza localStorage com dados mais recentes
        localStorage.setItem('user', JSON.stringify(response.data));
        
        return response.data;
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados do usuário:', error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Faz requisição autenticada
   */
  async makeAuthenticatedRequest(endpoint, method = 'GET', body = null) {
    // Recarrega tokens se necessário
    if (!this.accessToken) {
      this.loadTokensFromStorage();
    }
    
    if (!this.accessToken) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`,
        },
      };

      if (body) {
        config.body = JSON.stringify(body);
      }

      console.log(`🌐 Fazendo requisição: ${method} ${endpoint}`);
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        console.warn(`❌ Resposta com erro: ${response.status} - ${data.error || 'Erro desconhecido'}`);
        
        // Se token expirou, tenta renovar automaticamente
        if (response.status === 401 && (data.code === 'TOKEN_EXPIRED' || data.error?.includes('token') || data.error?.includes('expired'))) {
          console.log('🔄 Token expirado, tentando renovar...');
          
          try {
            const newTokens = await this.refreshTokens();
            console.log('✅ Token renovado com sucesso');
            
            // Tenta novamente com novo token
            config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            const retryResponse = await fetch(`${this.baseURL}${endpoint}`, config);
            const retryData = await retryResponse.json();
            
            if (!retryResponse.ok) {
              throw new Error(retryData.error || 'Erro na requisição após renovação');
            }
            
            console.log('✅ Requisição bem-sucedida após renovação do token');
            return retryData;
          } catch (refreshError) {
            console.error('❌ Falha ao renovar token:', refreshError.message);
            
            // Se falhou ao renovar, limpa tudo e força logout
            await this.logout();
            throw new Error('Sessão expirada. Faça login novamente.');
          }
        }
        
        throw new Error(data.error || `Erro na requisição: ${response.status}`);
      }

      console.log(`✅ Requisição bem-sucedida: ${method} ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`❌ Erro na requisição ${method} ${endpoint}:`, error.message);
      throw new Error(error.message);
    }
  }

  /**
   * Verifica se o usuário está logado
   */
  isAuthenticated() {
    // Recarrega tokens se necessário
    if (!this.accessToken && typeof window !== 'undefined') {
      this.loadTokensFromStorage();
    }
    
    return !!this.accessToken && !!this.refreshToken;
  }

  /**
   * Pega dados do usuário do localStorage
   */
  getUser() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Verifica se o token vai expirar em breve (5 minutos)
   */
  tokenWillExpireSoon() {
    if (!this.accessToken) return false;
    
    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const expTime = payload.exp * 1000; // Converte para ms
      const fiveMinutes = 5 * 60 * 1000; // 5 minutos em ms
      
      return (expTime - Date.now()) < fiveMinutes;
    } catch (error) {
      console.warn('Erro ao verificar expiração do token:', error.message);
      return true; // Se não conseguir verificar, assume que precisa renovar
    }
  }

  /**
   * Inicia renovação automática preventiva
   */
  startAutoRefresh() {
    // Verifica a cada minuto se precisa renovar
    setInterval(async () => {
      if (this.isAuthenticated() && this.tokenWillExpireSoon()) {
        try {
          await this.refreshTokens();
          console.log('🔄 Token renovado automaticamente');
        } catch (error) {
          console.warn('Erro na renovação automática:', error.message);
        }
      }
    }, 60 * 1000); // 1 minuto
  }
}

// Exporta instância singleton
export const authService = new AuthService();

// Inicia renovação automática quando carrega
if (typeof window !== 'undefined') {
  authService.startAutoRefresh();
}

export default authService;
