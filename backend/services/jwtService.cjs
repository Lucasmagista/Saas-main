const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class JwtService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET;
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '1d';
    this.refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';
    
    // Armazenamento em memória dos refresh tokens (em produção, use Redis ou banco)
    this.refreshTokens = new Map();
  }

  /**
   * Gera access token e refresh token
   */
  generateTokens(payload) {
    // Access Token (expira em 1 dia)
    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.accessTokenExpiry,
    });

    // Refresh Token (expira em 30 dias)
    const refreshToken = jwt.sign(
      { 
        userId: payload.id,
        type: 'refresh'
      }, 
      this.jwtSecret, 
      {
        expiresIn: this.refreshTokenExpiry,
      }
    );

    // Salva o refresh token associado ao usuário
    this.refreshTokens.set(refreshToken, {
      userId: payload.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessTokenExpiry
    };
  }

  /**
   * Verifica se um access token é válido
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Access token inválido ou expirado');
    }
  }

  /**
   * Verifica se um refresh token é válido
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      
      // Verifica se o refresh token existe no armazenamento
      const storedToken = this.refreshTokens.get(token);
      if (!storedToken) {
        throw new Error('Refresh token não encontrado');
      }

      // Verifica se não expirou
      if (new Date() > storedToken.expiresAt) {
        this.refreshTokens.delete(token);
        throw new Error('Refresh token expirado');
      }

      return decoded;
    } catch (error) {
      throw new Error('Refresh token inválido: ' + error.message);
    }
  }

  /**
   * Renova os tokens usando um refresh token válido
   */
  async refreshTokens(refreshToken, getUserData) {
    try {
      // Verifica o refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Busca dados atualizados do usuário
      const userData = await getUserData(decoded.userId);
      
      // Remove o refresh token antigo
      this.refreshTokens.delete(refreshToken);
      
      // Gera novos tokens
      const newTokens = this.generateTokens(userData);
      
      return {
        success: true,
        ...newTokens,
        user: userData
      };
    } catch (error) {
      throw new Error('Erro ao renovar tokens: ' + error.message);
    }
  }

  /**
   * Revoga um refresh token (logout)
   */
  revokeRefreshToken(refreshToken) {
    return this.refreshTokens.delete(refreshToken);
  }

  /**
   * Revoga todos os refresh tokens de um usuário
   */
  revokeAllUserTokens(userId) {
    let revokedCount = 0;
    for (const [token, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(token);
        revokedCount++;
      }
    }
    return revokedCount;
  }

  /**
   * Limpa tokens expirados (executar periodicamente)
   */
  cleanExpiredTokens() {
    const now = new Date();
    let cleanedCount = 0;
    
    for (const [token, data] of this.refreshTokens.entries()) {
      if (now > data.expiresAt) {
        this.refreshTokens.delete(token);
        cleanedCount++;
      }
    }
    
    return cleanedCount;
  }

  /**
   * Estatísticas dos tokens ativos
   */
  getTokenStats() {
    return {
      activeRefreshTokens: this.refreshTokens.size,
      tokensPerUser: this.getTokensPerUser()
    };
  }

  /**
   * Conta tokens por usuário
   */
  getTokensPerUser() {
    const userTokens = {};
    for (const [token, data] of this.refreshTokens.entries()) {
      userTokens[data.userId] = (userTokens[data.userId] || 0) + 1;
    }
    return userTokens;
  }
}

// Singleton instance
const jwtService = new JwtService();

// Limpa tokens expirados a cada hora
setInterval(() => {
  const cleaned = jwtService.cleanExpiredTokens();
  if (cleaned > 0) {
    console.log(`🧹 Limpeza automática: ${cleaned} refresh tokens expirados removidos`);
  }
}, 60 * 60 * 1000); // 1 hora

module.exports = jwtService;
