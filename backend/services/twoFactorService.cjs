const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const db = require('../postgresClient.cjs');
const logger = require('../logger.cjs');

class TwoFactorService {
  constructor() {
    this.issuer = 'SaaS Platform';
    this.algorithm = 'sha1';
    this.digits = 6;
    this.period = 30;
    this.window = 2; // Janela de tolerância para sincronização de tempo
  }

  /**
   * Gera secret TOTP para um usuário
   */
  async generateSecret(userId, userEmail) {
    try {
      const secret = speakeasy.generateSecret({
        name: userEmail,
        issuer: this.issuer,
        length: 32
      });

      // Salvar secret no banco (deve ser criptografado em produção)
      await db.query(`
        UPDATE users 
        SET two_factor_secret = $1, two_factor_enabled = false, updated_at = NOW()
        WHERE id = $2
      `, [secret.base32, userId]);

      // Gerar QR code
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        otpauthUrl: secret.otpauth_url
      };
    } catch (error) {
      logger.error('Error generating 2FA secret:', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Verifica código TOTP
   */
  async verifyToken(userId, token) {
    try {
      // Buscar secret do usuário
      const result = await db.query(`
        SELECT two_factor_secret, two_factor_enabled 
        FROM users WHERE id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];
      
      if (!user.two_factor_secret) {
        throw new Error('2FA not configured');
      }

      if (!user.two_factor_enabled) {
        throw new Error('2FA not enabled');
      }

      // Verificar token
      const verified = speakeasy.totp.verify({
        secret: user.two_factor_secret,
        encoding: 'base32',
        token: token,
        window: this.window,
        algorithm: this.algorithm,
        digits: this.digits,
        period: this.period
      });

      return verified;
    } catch (error) {
      logger.error('Error verifying 2FA token:', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Habilita 2FA para um usuário
   */
  async enable2FA(userId, token) {
    try {
      // Verificar se o token está correto
      const isValid = await this.verifyToken(userId, token);
      
      if (!isValid) {
        throw new Error('Invalid 2FA token');
      }

      // Habilitar 2FA
      await db.query(`
        UPDATE users 
        SET two_factor_enabled = true, updated_at = NOW()
        WHERE id = $1
      `, [userId]);

      logger.info('2FA enabled for user:', { userId });
      return true;
    } catch (error) {
      logger.error('Error enabling 2FA:', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Desabilita 2FA para um usuário
   */
  async disable2FA(userId, token) {
    try {
      // Verificar se o token está correto
      const isValid = await this.verifyToken(userId, token);
      
      if (!isValid) {
        throw new Error('Invalid 2FA token');
      }

      // Desabilitar 2FA e limpar secret
      await db.query(`
        UPDATE users 
        SET two_factor_enabled = false, two_factor_secret = NULL, updated_at = NOW()
        WHERE id = $1
      `, [userId]);

      logger.info('2FA disabled for user:', { userId });
      return true;
    } catch (error) {
      logger.error('Error disabling 2FA:', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Verifica se usuário tem 2FA habilitado
   */
  async is2FAEnabled(userId) {
    try {
      const result = await db.query(`
        SELECT two_factor_enabled 
        FROM users WHERE id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return false;
      }

      return result.rows[0].two_factor_enabled;
    } catch (error) {
      logger.error('Error checking 2FA status:', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Gera backup codes para recuperação
   */
  async generateBackupCodes(userId) {
    try {
      const codes = [];
      for (let i = 0; i < 10; i++) {
        codes.push(speakeasy.generateSecret({ length: 10 }).base32);
      }

      // Hash dos códigos antes de salvar
      const hashedCodes = codes.map(code => 
        require('crypto').createHash('sha256').update(code).digest('hex')
      );

      await db.query(`
        UPDATE users 
        SET backup_codes = $1, updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(hashedCodes), userId]);

      return codes;
    } catch (error) {
      logger.error('Error generating backup codes:', { error: error.message, userId });
      throw error;
    }
  }

  /**
   * Verifica backup code
   */
  async verifyBackupCode(userId, code) {
    try {
      const result = await db.query(`
        SELECT backup_codes 
        FROM users WHERE id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return false;
      }

      const backupCodes = JSON.parse(result.rows[0].backup_codes || '[]');
      const hashedCode = require('crypto').createHash('sha256').update(code).digest('hex');

      const index = backupCodes.indexOf(hashedCode);
      if (index === -1) {
        return false;
      }

      // Remover código usado
      backupCodes.splice(index, 1);
      await db.query(`
        UPDATE users 
        SET backup_codes = $1, updated_at = NOW()
        WHERE id = $2
      `, [JSON.stringify(backupCodes), userId]);

      return true;
    } catch (error) {
      logger.error('Error verifying backup code:', { error: error.message, userId });
      return false;
    }
  }

  /**
   * Valida token durante login
   */
  async validateLogin2FA(userId, token) {
    try {
      // Verificar se 2FA está habilitado
      const isEnabled = await this.is2FAEnabled(userId);
      if (!isEnabled) {
        return true; // 2FA não habilitado, login permitido
      }

      // Tentar verificar como TOTP
      try {
        return await this.verifyToken(userId, token);
      } catch (error) {
        // Se falhar, tentar como backup code
        return await this.verifyBackupCode(userId, token);
      }
    } catch (error) {
      logger.error('Error validating login 2FA:', { error: error.message, userId });
      return false;
    }
  }
}

module.exports = new TwoFactorService();