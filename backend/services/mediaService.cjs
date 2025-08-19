const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const sharp = require('sharp');
const db = require('../postgresClient.cjs');
const logger = require('../logger.cjs');
const secretsManager = require('./secretsManager.cjs');

class MediaService {
  constructor() {
    this.uploadDir = 'uploads';
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      video: ['video/mp4', 'video/webm', 'video/ogg'],
      audio: ['audio/mp3', 'audio/wav', 'audio/ogg'],
      document: ['application/pdf', 'text/plain', 'application/msword']
    };
    
    this.ensureUploadDir();
  }

  /**
   * Configuração do multer para upload
   */
  getUploadMiddleware() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const type = this.getFileType(file.mimetype);
        const uploadPath = path.join(this.uploadDir, type);
        this.ensureDir(uploadPath);
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueName = this.generateUniqueFileName(file.originalname);
        cb(null, uniqueName);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (this.isAllowedFile(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de arquivo não permitido'), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: 10 // Máximo 10 arquivos por upload
      }
    });
  }

  /**
   * Processa upload de arquivo
   */
  async processUpload(file, userId, metadata = {}) {
    try {
      const fileInfo = await this.analyzeFile(file);
      
      // Criar registro no banco
      const mediaId = await this.createMediaRecord({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        type: fileInfo.type,
        userId,
        metadata
      });

      // Processar arquivo baseado no tipo
      await this.processFile(file.path, fileInfo.type, metadata);

      logger.info('File uploaded successfully', {
        mediaId,
        filename: file.filename,
        type: fileInfo.type,
        size: file.size
      });

      return {
        id: mediaId,
        filename: file.filename,
        type: fileInfo.type,
        size: file.size,
        url: this.getFileUrl(file.filename, fileInfo.type)
      };
    } catch (error) {
      logger.error('Error processing upload:', error);
      throw error;
    }
  }

  /**
   * Cria template de mensagem
   */
  async createMessageTemplate(data) {
    try {
      const templateId = await db.query(`
        INSERT INTO message_templates (
          name, description, content, type, variables, media_id, 
          is_active, created_by, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        RETURNING id
      `, [
        data.name,
        data.description,
        data.content,
        data.type || 'text',
        JSON.stringify(data.variables || []),
        data.mediaId,
        data.isActive !== false,
        data.createdBy
      ]);

      logger.info('Message template created', { templateId: templateId.rows[0].id });
      return templateId.rows[0].id;
    } catch (error) {
      logger.error('Error creating message template:', error);
      throw error;
    }
  }

  /**
   * Lista templates de mensagem
   */
  async listMessageTemplates(filters = {}) {
    try {
      let query = `
        SELECT 
          mt.*,
          m.filename as media_filename,
          m.type as media_type,
          u.name as created_by_name
        FROM message_templates mt
        LEFT JOIN media m ON mt.media_id = m.id
        LEFT JOIN users u ON mt.created_by = u.id
        WHERE 1=1
      `;
      const params = [];
      let paramIndex = 1;

      if (filters.type) {
        query += ` AND mt.type = $${paramIndex}`;
        params.push(filters.type);
        paramIndex++;
      }

      if (filters.isActive !== undefined) {
        query += ` AND mt.is_active = $${paramIndex}`;
        params.push(filters.isActive);
        paramIndex++;
      }

      if (filters.createdBy) {
        query += ` AND mt.created_by = $${paramIndex}`;
        params.push(filters.createdBy);
        paramIndex++;
      }

      query += ` ORDER BY mt.created_at DESC`;

      const result = await db.query(query, params);
      return result.rows;
    } catch (error) {
      logger.error('Error listing message templates:', error);
      throw error;
    }
  }

  /**
   * Renderiza template com variáveis
   */
  async renderTemplate(templateId, variables = {}) {
    try {
      const template = await this.getMessageTemplate(templateId);
      if (!template) {
        throw new Error('Template not found');
      }

      let content = template.content;
      const templateVars = template.variables || [];

      // Substituir variáveis no conteúdo
      templateVars.forEach(variable => {
        const value = variables[variable.name] || variable.default || '';
        const regex = new RegExp(`{{${variable.name}}}`, 'g');
        content = content.replace(regex, value);
      });

      return {
        content,
        type: template.type,
        mediaId: template.media_id,
        variables: templateVars
      };
    } catch (error) {
      logger.error('Error rendering template:', error);
      throw error;
    }
  }

  /**
   * Processa arquivo baseado no tipo
   */
  async processFile(filePath, type, metadata = {}) {
    try {
      switch (type) {
        case 'image':
          await this.processImage(filePath, metadata);
          break;
        case 'video':
          await this.processVideo(filePath, metadata);
          break;
        case 'audio':
          await this.processAudio(filePath, metadata);
          break;
        case 'document':
          await this.processDocument(filePath, metadata);
          break;
      }
    } catch (error) {
      logger.error('Error processing file:', error);
      throw error;
    }
  }

  /**
   * Processa imagem (redimensionar, otimizar)
   */
  async processImage(filePath, metadata = {}) {
    try {
      const image = sharp(filePath);
      const imageInfo = await image.metadata();

      // Criar thumbnail
      const thumbnailPath = filePath.replace(/\.[^/.]+$/, '_thumb.jpg');
      await image
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // Otimizar imagem original se necessário
      if (imageInfo.width > 1920 || imageInfo.height > 1080) {
        const optimizedPath = filePath.replace(/\.[^/.]+$/, '_optimized.jpg');
        await image
          .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 85 })
          .toFile(optimizedPath);
      }

      logger.info('Image processed successfully', { filePath });
    } catch (error) {
      logger.error('Error processing image:', error);
      throw error;
    }
  }

  /**
   * Processa vídeo (extrair thumbnail, metadados)
   */
  async processVideo(filePath, metadata = {}) {
    try {
      // Em produção, usar ffmpeg para processar vídeos
      // Por enquanto, apenas log
      logger.info('Video processing placeholder', { filePath });
    } catch (error) {
      logger.error('Error processing video:', error);
      throw error;
    }
  }

  /**
   * Processa áudio (converter formato, extrair metadados)
   */
  async processAudio(filePath, metadata = {}) {
    try {
      // Em produção, usar ffmpeg para processar áudio
      logger.info('Audio processing placeholder', { filePath });
    } catch (error) {
      logger.error('Error processing audio:', error);
      throw error;
    }
  }

  /**
   * Processa documento (extrair texto, gerar preview)
   */
  async processDocument(filePath, metadata = {}) {
    try {
      // Em produção, usar bibliotecas específicas para cada tipo
      logger.info('Document processing placeholder', { filePath });
    } catch (error) {
      logger.error('Error processing document:', error);
      throw error;
    }
  }

  /**
   * Analisa arquivo e extrai informações
   */
  async analyzeFile(file) {
    const type = this.getFileType(file.mimetype);
    const hash = await this.calculateFileHash(file.path);
    
    return {
      type,
      hash,
      dimensions: type === 'image' ? await this.getImageDimensions(file.path) : null,
      duration: type === 'video' || type === 'audio' ? await this.getMediaDuration(file.path) : null
    };
  }

  /**
   * Cria registro de mídia no banco
   */
  async createMediaRecord(data) {
    try {
      const result = await db.query(`
        INSERT INTO media (
          original_name, filename, path, size, mimetype, type,
          hash, dimensions, duration, metadata, user_id, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
        RETURNING id
      `, [
        data.originalName,
        data.filename,
        data.path,
        data.size,
        data.mimetype,
        data.type,
        data.hash,
        data.dimensions ? JSON.stringify(data.dimensions) : null,
        data.duration,
        JSON.stringify(data.metadata || {}),
        data.userId
      ]);

      return result.rows[0].id;
    } catch (error) {
      logger.error('Error creating media record:', error);
      throw error;
    }
  }

  /**
   * Obtém template de mensagem
   */
  async getMessageTemplate(templateId) {
    try {
      const result = await db.query(`
        SELECT * FROM message_templates WHERE id = $1
      `, [templateId]);

      if (result.rows.length === 0) {
        return null;
      }

      const template = result.rows[0];
      template.variables = JSON.parse(template.variables || '[]');
      
      return template;
    } catch (error) {
      logger.error('Error getting message template:', error);
      throw error;
    }
  }

  /**
   * Obtém arquivo de mídia
   */
  async getMedia(mediaId) {
    try {
      const result = await db.query(`
        SELECT * FROM media WHERE id = $1
      `, [mediaId]);

      if (result.rows.length === 0) {
        return null;
      }

      const media = result.rows[0];
      media.metadata = JSON.parse(media.metadata || '{}');
      media.dimensions = media.dimensions ? JSON.parse(media.dimensions) : null;
      
      return media;
    } catch (error) {
      logger.error('Error getting media:', error);
      throw error;
    }
  }

  /**
   * Remove arquivo de mídia
   */
  async deleteMedia(mediaId) {
    try {
      const media = await this.getMedia(mediaId);
      if (!media) {
        throw new Error('Media not found');
      }

      // Remover arquivo físico
      await fs.unlink(media.path);
      
      // Remover thumbnail se existir
      const thumbnailPath = media.path.replace(/\.[^/.]+$/, '_thumb.jpg');
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Thumbnail pode não existir
      }

      // Remover registro do banco
      await db.query('DELETE FROM media WHERE id = $1', [mediaId]);

      logger.info('Media deleted successfully', { mediaId });
      return true;
    } catch (error) {
      logger.error('Error deleting media:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  getFileType(mimetype) {
    for (const [type, types] of Object.entries(this.allowedTypes)) {
      if (types.includes(mimetype)) {
        return type;
      }
    }
    return 'document';
  }

  isAllowedFile(mimetype) {
    return Object.values(this.allowedTypes).flat().includes(mimetype);
  }

  generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(originalName);
    const name = path.basename(originalName, ext);
    return `${name}_${timestamp}_${random}${ext}`;
  }

  async calculateFileHash(filePath) {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  async getImageDimensions(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      return {
        width: metadata.width,
        height: metadata.height
      };
    } catch (error) {
      return null;
    }
  }

  async getMediaDuration(filePath) {
    // Em produção, usar ffprobe para obter duração
    return null;
  }

  getFileUrl(filename, type) {
    return `/api/media/${type}/${filename}`;
  }

  async ensureUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
      for (const type of Object.keys(this.allowedTypes)) {
        await fs.mkdir(path.join(this.uploadDir, type), { recursive: true });
      }
    } catch (error) {
      logger.error('Error creating upload directories:', error);
    }
  }

  async ensureDir(dirPath) {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      logger.error('Error creating directory:', error);
    }
  }
}

module.exports = new MediaService();