const express = require('express');
const { z } = require('zod');
const { validate, commonSchemas, entitySchemas } = require('../middleware/validate.cjs');
const { withETag } = require('../middleware/etag.cjs');
const { idempotency } = require('../middleware/idempotency.cjs');
const { createPaginationMiddleware } = require('../middleware/pagination.cjs');
const { rateLimiters } = require('../middleware/rateLimit.cjs');
const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const db = require('../postgresClient.cjs');
const queueService = require('../services/queueService.cjs');

const router = express.Router();

// Schemas específicos para mensagens
const messageSchemas = {
  create: entitySchemas.message.create,
  send: entitySchemas.message.send,
  batch: z.object({
    messages: z.array(entitySchemas.message.send).min(1).max(100)
  }),
  filter: z.object({
    bot_id: z.string().uuid().optional(),
    type: z.enum(['text', 'media', 'template']).optional(),
    status: z.enum(['pending', 'sent', 'failed', 'delivered']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  })
};

// GET /messages - Listar mensagens com paginação, filtros e ETag
router.get('/', 
  createPaginationMiddleware(['created_at', 'updated_at', 'status', 'type']),
  validate({ query: messageSchemas.filter }),
  withETag(async (req, res) => {
    try {
      const { limit, offset, orderBy, order } = res.locals.pagination;
      const filters = req.query;
      
      let whereClause = 'WHERE 1=1';
      const params = [];
      let paramCount = 1;
      
      if (filters.bot_id) {
        whereClause += ` AND bot_id = $${paramCount}`;
        params.push(filters.bot_id);
        paramCount++;
      }
      
      if (filters.type) {
        whereClause += ` AND type = $${paramCount}`;
        params.push(filters.type);
        paramCount++;
      }
      
      if (filters.status) {
        whereClause += ` AND status = $${paramCount}`;
        params.push(filters.status);
        paramCount++;
      }
      
      if (filters.startDate) {
        whereClause += ` AND created_at >= $${paramCount}`;
        params.push(filters.startDate);
        paramCount++;
      }
      
      if (filters.endDate) {
        whereClause += ` AND created_at <= $${paramCount}`;
        params.push(filters.endDate);
        paramCount++;
      }
      
      const orderClause = orderBy ? ` ORDER BY ${orderBy} ${order.toUpperCase()}` : ' ORDER BY created_at DESC';
      
      const total = await db.query(`SELECT COUNT(1) AS count FROM messages ${whereClause}`, params);
      const result = await db.query(
        `SELECT * FROM messages ${whereClause}${orderClause} LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...params, limit, offset]
      );
      
      res.set('X-Total-Count', String(total.rows[0].count));
      res.json(result.rows);
    } catch (error) {
      logger.error('Erro ao listar mensagens:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// POST /messages - Criar mensagem com Idempotency
router.post('/', 
  idempotency(),
  rateLimiters.api,
  validate({ body: messageSchemas.create }),
  async (req, res) => {
    try {
      const { bot_id, content, type, metadata } = req.body;
      
      // Verificar se o bot existe e está ativo
      const botResult = await db.query('SELECT id, is_active FROM bots WHERE id = $1', [bot_id]);
      if (botResult.rows.length === 0) {
        return res.status(404).json({ error: 'Bot não encontrado' });
      }
      
      if (!botResult.rows[0].is_active) {
        return res.status(400).json({ error: 'Bot não está ativo' });
      }
      
      // Criar registro da mensagem
      const result = await db.query(`
        INSERT INTO messages (bot_id, content, type, metadata, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [bot_id, content, type, JSON.stringify(metadata || {}), 'pending', req.user?.id]);
      
      const message = result.rows[0];
      
      // Adicionar à fila para processamento
      await queueService.addJob('messages', 'send', {
        messageId: message.id,
        botId: bot_id,
        content,
        type,
        metadata
      }, {
        jobId: `msg_${message.id}`,
        delay: 1000 // Delay de 1 segundo
      });
      
      await logAudit({ 
        req, 
        action: 'create', 
        resourceType: 'message', 
        resourceId: message.id,
        newValues: { bot_id, content, type }
      });
      
      res.status(201).json({
        success: true,
        message: {
          ...message,
          queueStatus: 'queued'
        }
      });
    } catch (error) {
      logger.error('Erro ao criar mensagem:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /messages/send - Enviar mensagem imediatamente
router.post('/send', 
  idempotency(),
  rateLimiters.api,
  validate({ body: messageSchemas.send }),
  async (req, res) => {
    try {
      const { to, content, type, metadata } = req.body;
      
      // Verificar se há bot ativo disponível
      const botResult = await db.query('SELECT id FROM bots WHERE is_active = true LIMIT 1');
      if (botResult.rows.length === 0) {
        return res.status(400).json({ error: 'Nenhum bot ativo disponível' });
      }
      
      const botId = botResult.rows[0].id;
      
      // Criar registro da mensagem
      const result = await db.query(`
        INSERT INTO messages (bot_id, to_number, content, type, metadata, status, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [botId, to, content, type, JSON.stringify(metadata || {}), 'pending', req.user?.id]);
      
      const message = result.rows[0];
      
      // Adicionar à fila para processamento imediato
      await queueService.addJob('messages', 'send', {
        messageId: message.id,
        botId,
        to,
        content,
        type,
        metadata
      }, {
        jobId: `msg_${message.id}`,
        priority: 1 // Alta prioridade
      });
      
      await logAudit({ 
        req, 
        action: 'send', 
        resourceType: 'message', 
        resourceId: message.id,
        newValues: { to, content, type }
      });
      
      res.json({
        success: true,
        message: {
          ...message,
          queueStatus: 'queued'
        }
      });
    } catch (error) {
      logger.error('Erro ao enviar mensagem:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /messages/batch - Enviar múltiplas mensagens
router.post('/batch', 
  idempotency(),
  rateLimiters.api,
  validate({ body: messageSchemas.batch }),
  async (req, res) => {
    try {
      const { messages } = req.body;
      
      // Verificar se há bot ativo disponível
      const botResult = await db.query('SELECT id FROM bots WHERE is_active = true LIMIT 1');
      if (botResult.rows.length === 0) {
        return res.status(400).json({ error: 'Nenhum bot ativo disponível' });
      }
      
      const botId = botResult.rows[0].id;
      const createdMessages = [];
      
      // Criar registros das mensagens
      for (const msg of messages) {
        const result = await db.query(`
          INSERT INTO messages (bot_id, to_number, content, type, metadata, status, created_by)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        `, [botId, msg.to, msg.content, msg.type, JSON.stringify(msg.metadata || {}), 'pending', req.user?.id]);
        
        const message = result.rows[0];
        createdMessages.push(message);
        
        // Adicionar à fila
        await queueService.addJob('messages', 'send', {
          messageId: message.id,
          botId,
          to: msg.to,
          content: msg.content,
          type: msg.type,
          metadata: msg.metadata
        }, {
          jobId: `msg_${message.id}`,
          delay: Math.random() * 5000 // Delay aleatório para evitar spam
        });
      }
      
      await logAudit({ 
        req, 
        action: 'batch_send', 
        resourceType: 'message', 
        resourceId: null,
        newValues: { count: messages.length }
      });
      
      res.status(201).json({
        success: true,
        messages: createdMessages.map(msg => ({
          ...msg,
          queueStatus: 'queued'
        })),
        total: createdMessages.length
      });
    } catch (error) {
      logger.error('Erro ao enviar mensagens em lote:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /messages/:id - Buscar mensagem específica
router.get('/:id', 
  validate({ params: commonSchemas.idParam }),
  withETag(async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query('SELECT * FROM messages WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      logger.error('Erro ao buscar mensagem:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// DELETE /messages/:id - Remover mensagem
router.delete('/:id', 
  idempotency(),
  validate({ params: commonSchemas.idParam }),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const currentResult = await db.query('SELECT * FROM messages WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Mensagem não encontrada' });
      }
      
      await db.query('DELETE FROM messages WHERE id = $1', [id]);
      
      await logAudit({ 
        req, 
        action: 'delete', 
        resourceType: 'message', 
        resourceId: id,
        oldValues: currentResult.rows[0]
      });
      
      res.json({ success: true, message: 'Mensagem removida com sucesso' });
    } catch (error) {
      logger.error('Erro ao remover mensagem:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /messages/stats - Estatísticas de mensagens
router.get('/stats/overview', 
  withETag(async (req, res) => {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
          COUNT(CASE WHEN type = 'text' THEN 1 END) as text_messages,
          COUNT(CASE WHEN type = 'media' THEN 1 END) as media_messages,
          COUNT(CASE WHEN type = 'template' THEN 1 END) as template_messages
        FROM messages
      `);
      
      res.json(stats.rows[0]);
    } catch (error) {
      logger.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

module.exports = router;