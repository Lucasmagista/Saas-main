const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../postgresClient.cjs');
const redis = require('./redisService.cjs');
const logger = require('../logger.cjs');
const config = require('../config.cjs');

class RefreshTokenService {
  constructor() {
    this.saltRounds = 12;
  }

  /**
   * Gera um novo par de tokens (access + refresh)
   */
  async generateTokenPair(userId, ipAddress = null, userAgent = null) {
    try {
      const familyId = uuidv4();
      const refreshToken = crypto.randomBytes(64).toString('hex');
      const refreshTokenHash = await bcrypt.hash(refreshToken, this.saltRounds);
      
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias

      // Salvar refresh token no banco
      await db.query(`
        INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at, ip_address, user_agent)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, refreshTokenHash, familyId, expiresAt, ipAddress, userAgent]);

      // Cache no Redis para performance
      await redis.setex(`refresh_token:${familyId}`, 30 * 24 * 60 * 60, JSON.stringify({
        userId,
        expiresAt: expiresAt.toISOString(),
        isRevoked: false
      }));

      return {
        accessToken: this.generateAccessToken(userId),
        refreshToken,
        familyId,
        expiresAt
      };
    } catch (error) {
      logger.error('Error generating token pair', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Gera access token JWT
   */
  generateAccessToken(userId) {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { userId, type: 'access' },
      config.jwtSecret,
      { expiresIn: config.accessTokenExpiry }
    );
  }

  /**
   * Valida e renova tokens
   */
  async refreshTokens(refreshToken, familyId) {
    try {
      // Verificar cache primeiro
      const cached = await redis.get(`refresh_token:${familyId}`);
      if (cached) {
        const tokenData = JSON.parse(cached);
        if (tokenData.isRevoked) {
          throw new Error('Token family revoked');
        }
      }

      // Buscar no banco
      const result = await db.query(`
        SELECT rt.*, u.id as user_id, u.email
        FROM refresh_tokens rt
        JOIN users u ON rt.user_id = u.id
        WHERE rt.family_id = $1 AND rt.is_revoked = false AND rt.expires_at > NOW()
      `, [familyId]);

      if (result.rows.length === 0) {
        throw new Error('Invalid refresh token');
      }

      const tokenRecord = result.rows[0];
      
      // Verificar hash do token
      const isValid = await bcrypt.compare(refreshToken, tokenRecord.token_hash);
      if (!isValid) {
        throw new Error('Invalid refresh token');
      }

      // Revogar token atual
      await this.revokeToken(familyId);

      // Gerar novo par de tokens
      return await this.generateTokenPair(tokenRecord.user_id, tokenRecord.ip_address, tokenRecord.user_agent);
    } catch (error) {
      logger.error('Error refreshing tokens', { error: error.message, familyId });
      throw error;
    }
  }

  /**
   * Revoga um token específico
   */
  async revokeToken(familyId) {
    try {
      await db.query(`
        UPDATE refresh_tokens 
        SET is_revoked = true, updated_at = NOW()
        WHERE family_id = $1
      `, [familyId]);

      await redis.del(`refresh_token:${familyId}`);
      
      logger.info('Token revoked', { familyId });
    } catch (error) {
      logger.error('Error revoking token', { error: error.message, familyId });
      throw error;
    }
  }

  /**
   * Revoga todos os tokens de um usuário
   */
  async revokeAllUserTokens(userId) {
    try {
      await db.query(`
        UPDATE refresh_tokens 
        SET is_revoked = true, updated_at = NOW()
        WHERE user_id = $1 AND is_revoked = false
      `, [userId]);

      // Limpar cache
      const result = await db.query(`
        SELECT family_id FROM refresh_tokens WHERE user_id = $1
      `, [userId]);

      for (const row of result.rows) {
        await redis.del(`refresh_token:${row.family_id}`);
      }

      logger.info('All user tokens revoked', { userId });
    } catch (error) {
      logger.error('Error revoking all user tokens', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Verifica se um token está revogado
   */
  async isTokenRevoked(familyId) {
    try {
      const cached = await redis.get(`refresh_token:${familyId}`);
      if (cached) {
        const tokenData = JSON.parse(cached);
        return tokenData.isRevoked;
      }

      const result = await db.query(`
        SELECT is_revoked FROM refresh_tokens WHERE family_id = $1
      `, [familyId]);

      return result.rows.length > 0 && result.rows[0].is_revoked;
    } catch (error) {
      logger.error('Error checking token revocation', { error: error.message, familyId });
      return true; // Em caso de erro, considerar como revogado
    }
  }

  /**
   * Lista tokens ativos de um usuário
   */
  async getUserTokens(userId) {
    try {
      const result = await db.query(`
        SELECT id, family_id, ip_address, user_agent, created_at, expires_at
        FROM refresh_tokens
        WHERE user_id = $1 AND is_revoked = false AND expires_at > NOW()
        ORDER BY created_at DESC
      `, [userId]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting user tokens', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Limpa tokens expirados
   */
  async cleanupExpiredTokens() {
    try {
      const result = await db.query(`
        DELETE FROM refresh_tokens WHERE expires_at < NOW()
      `);

      logger.info('Expired tokens cleaned up', { count: result.rowCount });
      return result.rowCount;
    } catch (error) {
      logger.error('Error cleaning up expired tokens', { error: error.message });
      throw error;
    }
  }
}

module.exports = new RefreshTokenService();