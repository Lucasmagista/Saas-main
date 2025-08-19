const crypto = require('crypto');
const db = require('../postgresClient.cjs');
const logger = require('../logger.cjs');

class SecretsManager {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32;
    this.ivLength = 16;
    this.tagLength = 16;
  }

  /**
   * Gera uma nova chave mestra
   */
  generateMasterKey() {
    return crypto.randomBytes(this.keyLength);
  }

  /**
   * Deriva uma chave de um password
   */
  deriveKey(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, this.keyLength, 'sha256');
  }

  /**
   * Criptografa um secret
   */
  encryptSecret(secret, key) {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    
    let encrypted = cipher.update(secret, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }

  /**
   * Descriptografa um secret
   */
  decryptSecret(encryptedData, key) {
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Armazena um secret criptografado
   */
  async storeSecret(name, value, description = null, expiresAt = null) {
    try {
      // Gerar chave de criptografia
      const key = this.generateMasterKey();
      
      // Criptografar o secret
      const encrypted = this.encryptSecret(value, key);
      
      // Armazenar no banco
      const result = await db.query(`
        INSERT INTO secrets (name, encrypted_value, iv, tag, description, expires_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        RETURNING id
      `, [
        name,
        encrypted.encrypted,
        encrypted.iv,
        encrypted.tag,
        description,
        expiresAt
      ]);

      // Armazenar a chave de forma segura (em produção, usar HSM ou serviço externo)
      await this.storeKey(result.rows[0].id, key);

      logger.info('Secret stored successfully', { name, id: result.rows[0].id });
      return result.rows[0].id;
    } catch (error) {
      logger.error('Error storing secret:', error);
      throw error;
    }
  }

  /**
   * Recupera um secret descriptografado
   */
  async retrieveSecret(name) {
    try {
      // Buscar secret criptografado
      const secretResult = await db.query(`
        SELECT id, encrypted_value, iv, tag, expires_at
        FROM secrets 
        WHERE name = $1 AND (expires_at IS NULL OR expires_at > NOW())
      `, [name]);

      if (secretResult.rows.length === 0) {
        throw new Error('Secret not found or expired');
      }

      const secret = secretResult.rows[0];

      // Recuperar chave de descriptografia
      const key = await this.retrieveKey(secret.id);

      // Descriptografar
      const decrypted = this.decryptSecret({
        encrypted: secret.encrypted_value,
        iv: secret.iv,
        tag: secret.tag
      }, key);

      logger.info('Secret retrieved successfully', { name });
      return decrypted;
    } catch (error) {
      logger.error('Error retrieving secret:', error);
      throw error;
    }
  }

  /**
   * Atualiza um secret existente
   */
  async updateSecret(name, newValue, description = null) {
    try {
      // Verificar se o secret existe
      const existingResult = await db.query('SELECT id FROM secrets WHERE name = $1', [name]);
      if (existingResult.rows.length === 0) {
        throw new Error('Secret not found');
      }

      // Gerar nova chave
      const newKey = this.generateMasterKey();
      const encrypted = this.encryptSecret(newValue, newKey);

      // Atualizar no banco
      await db.query(`
        UPDATE secrets 
        SET encrypted_value = $1, iv = $2, tag = $3, description = $4, updated_at = NOW()
        WHERE name = $5
      `, [
        encrypted.encrypted,
        encrypted.iv,
        encrypted.tag,
        description,
        name
      ]);

      // Atualizar chave
      await this.updateKey(existingResult.rows[0].id, newKey);

      logger.info('Secret updated successfully', { name });
      return true;
    } catch (error) {
      logger.error('Error updating secret:', error);
      throw error;
    }
  }

  /**
   * Remove um secret
   */
  async deleteSecret(name) {
    try {
      const result = await db.query('DELETE FROM secrets WHERE name = $1 RETURNING id', [name]);
      
      if (result.rows.length > 0) {
        // Remover chave associada
        await this.deleteKey(result.rows[0].id);
        logger.info('Secret deleted successfully', { name });
      }

      return result.rows.length > 0;
    } catch (error) {
      logger.error('Error deleting secret:', error);
      throw error;
    }
  }

  /**
   * Lista todos os secrets
   */
  async listSecrets() {
    try {
      const result = await db.query(`
        SELECT name, description, created_at, updated_at, expires_at
        FROM secrets
        ORDER BY name
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error listing secrets:', error);
      throw error;
    }
  }

  /**
   * Rotaciona um secret
   */
  async rotateSecret(name, newValue = null) {
    try {
      // Recuperar valor atual
      const currentValue = await this.retrieveSecret(name);
      
      // Gerar novo valor se não fornecido
      const valueToUse = newValue || this.generateRandomSecret();
      
      // Atualizar secret
      await this.updateSecret(name, valueToUse);
      
      logger.info('Secret rotated successfully', { name });
      return true;
    } catch (error) {
      logger.error('Error rotating secret:', error);
      throw error;
    }
  }

  /**
   * Gera um secret aleatório
   */
  generateRandomSecret(length = 32) {
    return crypto.randomBytes(length).toString('base64');
  }

  /**
   * Verifica se um secret expirou
   */
  async checkSecretExpiration(name) {
    try {
      const result = await db.query(`
        SELECT expires_at 
        FROM secrets 
        WHERE name = $1
      `, [name]);

      if (result.rows.length === 0) {
        return { exists: false, expired: false };
      }

      const expiresAt = result.rows[0].expires_at;
      const isExpired = expiresAt && new Date() > expiresAt;

      return {
        exists: true,
        expired: isExpired,
        expiresAt: expiresAt
      };
    } catch (error) {
      logger.error('Error checking secret expiration:', error);
      throw error;
    }
  }

  /**
   * Armazena chave de criptografia (implementação básica)
   */
  async storeKey(secretId, key) {
    // Em produção, usar HSM ou serviço externo como AWS KMS, Azure Key Vault, etc.
    // Por enquanto, armazenar criptografado com uma chave mestra
    const masterKey = process.env.MASTER_KEY || 'default-master-key-change-in-production';
    const encryptedKey = this.encryptSecret(key.toString('base64'), masterKey);
    
    await db.query(`
      INSERT INTO secret_keys (secret_id, encrypted_key, iv, tag)
      VALUES ($1, $2, $3, $4)
    `, [
      secretId,
      encryptedKey.encrypted,
      encryptedKey.iv,
      encryptedKey.tag
    ]);
  }

  /**
   * Recupera chave de criptografia
   */
  async retrieveKey(secretId) {
    const masterKey = process.env.MASTER_KEY || 'default-master-key-change-in-production';
    
    const result = await db.query(`
      SELECT encrypted_key, iv, tag
      FROM secret_keys
      WHERE secret_id = $1
    `, [secretId]);

    if (result.rows.length === 0) {
      throw new Error('Key not found');
    }

    const keyData = result.rows[0];
    const decryptedKey = this.decryptSecret({
      encrypted: keyData.encrypted_key,
      iv: keyData.iv,
      tag: keyData.tag
    }, masterKey);

    return Buffer.from(decryptedKey, 'base64');
  }

  /**
   * Atualiza chave de criptografia
   */
  async updateKey(secretId, newKey) {
    const masterKey = process.env.MASTER_KEY || 'default-master-key-change-in-production';
    const encryptedKey = this.encryptSecret(newKey.toString('base64'), masterKey);
    
    await db.query(`
      UPDATE secret_keys
      SET encrypted_key = $1, iv = $2, tag = $3, updated_at = NOW()
      WHERE secret_id = $4
    `, [
      encryptedKey.encrypted,
      encryptedKey.iv,
      encryptedKey.tag,
      secretId
    ]);
  }

  /**
   * Remove chave de criptografia
   */
  async deleteKey(secretId) {
    await db.query('DELETE FROM secret_keys WHERE secret_id = $1', [secretId]);
  }

  /**
   * Valida integridade dos secrets
   */
  async validateSecrets() {
    try {
      const secrets = await this.listSecrets();
      const validationResults = [];

      for (const secret of secrets) {
        try {
          await this.retrieveSecret(secret.name);
          validationResults.push({
            name: secret.name,
            valid: true,
            error: null
          });
        } catch (error) {
          validationResults.push({
            name: secret.name,
            valid: false,
            error: error.message
          });
        }
      }

      return validationResults;
    } catch (error) {
      logger.error('Error validating secrets:', error);
      throw error;
    }
  }
}

module.exports = new SecretsManager();