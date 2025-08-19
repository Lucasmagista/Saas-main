const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config.cjs');
const logger = require('../logger.cjs');

class JWTService {
  constructor() {
    this.secret = config.jwtSecret;
    this.accessTokenExpiry = config.jwtExpiresIn;
    this.refreshTokenExpiry = config.refreshTokenExpiresIn;
  }

  /**
   * Gera um access token
   * @param {Object} payload - Dados do usuário
   * @returns {string} - Access token
   */
  generateAccessToken(payload) {
    try {
      return jwt.sign(payload, this.secret, {
        expiresIn: this.accessTokenExpiry,
        issuer: 'saas-platform',
        audience: 'saas-platform-users',
      });
    } catch (error) {
      logger.error('Erro ao gerar access token:', error);
      throw new Error('Erro ao gerar token de acesso');
    }
  }

  /**
   * Gera um refresh token
   * @param {Object} payload - Dados do usuário
   * @returns {string} - Refresh token
   */
  generateRefreshToken(payload) {
    try {
      return jwt.sign(payload, this.secret, {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'saas-platform',
        audience: 'saas-platform-refresh',
      });
    } catch (error) {
      logger.error('Erro ao gerar refresh token:', error);
      throw new Error('Erro ao gerar refresh token');
    }
  }

  /**
   * Gera ambos os tokens (access e refresh)
   * @param {Object} payload - Dados do usuário
   * @returns {Object} - Objeto com access e refresh tokens
   */
  generateTokenPair(payload) {
    try {
      const accessToken = this.generateAccessToken(payload);
      const refreshToken = this.generateRefreshToken(payload);

      return {
        accessToken,
        refreshToken,
        expiresIn: this.getTokenExpiry(this.accessTokenExpiry),
      };
    } catch (error) {
      logger.error('Erro ao gerar par de tokens:', error);
      throw new Error('Erro ao gerar tokens');
    }
  }

  /**
   * Verifica um access token
   * @param {string} token - Token a ser verificado
   * @returns {Object} - Payload decodificado
   */
  verifyAccessToken(token) {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'saas-platform',
        audience: 'saas-platform-users',
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Token inválido');
      }
      throw new Error('Erro ao verificar token');
    }
  }

  /**
   * Verifica um refresh token
   * @param {string} token - Token a ser verificado
   * @returns {Object} - Payload decodificado
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.secret, {
        issuer: 'saas-platform',
        audience: 'saas-platform-refresh',
      });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token expirado');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Refresh token inválido');
      }
      throw new Error('Erro ao verificar refresh token');
    }
  }

  /**
   * Renova um access token usando refresh token
   * @param {string} refreshToken - Refresh token válido
   * @returns {Object} - Novo par de tokens
   */
  refreshAccessToken(refreshToken) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);
      
      // Remove campos sensíveis do payload
      const { iat, exp, aud, iss, ...userData } = payload;
      
      // Gera novo par de tokens
      return this.generateTokenPair(userData);
    } catch (error) {
      logger.error('Erro ao renovar access token:', error);
      throw error;
    }
  }

  /**
   * Decodifica um token sem verificar (para debug)
   * @param {string} token - Token a ser decodificado
   * @returns {Object} - Payload decodificado
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      logger.error('Erro ao decodificar token:', error);
      throw new Error('Erro ao decodificar token');
    }
  }

  /**
   * Obtém o tempo de expiração em segundos
   * @param {string} expiry - String de expiração (ex: '15m', '7d')
   * @returns {number} - Tempo em segundos
   */
  getTokenExpiry(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 900; // 15 minutos padrão
    }

    const [, value, unit] = match;
    const multipliers = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return parseInt(value) * multipliers[unit];
  }

  /**
   * Verifica se um token está próximo de expirar
   * @param {string} token - Token a ser verificado
   * @param {number} threshold - Limite em segundos (padrão: 5 minutos)
   * @returns {boolean} - True se está próximo de expirar
   */
  isTokenNearExpiry(token, threshold = 300) {
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp - now <= threshold;
    } catch (error) {
      logger.error('Erro ao verificar expiração do token:', error);
      return true;
    }
  }

  /**
   * Gera hash de senha
   * @param {string} password - Senha em texto plano
   * @returns {string} - Hash da senha
   */
  async hashPassword(password) {
    try {
      const saltRounds = config.bcryptRounds;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      logger.error('Erro ao gerar hash da senha:', error);
      throw new Error('Erro ao processar senha');
    }
  }

  /**
   * Verifica senha
   * @param {string} password - Senha em texto plano
   * @param {string} hash - Hash da senha
   * @returns {boolean} - True se a senha está correta
   */
  async verifyPassword(password, hash) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      logger.error('Erro ao verificar senha:', error);
      return false;
    }
  }

  /**
   * Extrai token do header Authorization
   * @param {string} authHeader - Header Authorization
   * @returns {string|null} - Token ou null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }

  /**
   * Valida formato do token
   * @param {string} token - Token a ser validado
   * @returns {boolean} - True se o formato é válido
   */
  isValidTokenFormat(token) {
    if (!token || typeof token !== 'string') {
      return false;
    }
    
    // Verifica se tem 3 partes separadas por ponto
    const parts = token.split('.');
    return parts.length === 3;
  }
}

module.exports = new JWTService();
