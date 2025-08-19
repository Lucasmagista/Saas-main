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
const crypto = require('crypto');

const router = express.Router();

// Schemas específicos para webhooks
const webhookSchemas = {
  create: entitySchemas.webhook.create,
  update: entitySchemas.webhook.update,
  test: z.object({
    event: z.string().min(1),
    payload: z.any().optional()
  }),
  delivery: z.object({
    webhook_id: z.string().uuid(),
    status: z.enum(['pending', 'success', 'failed']),
    retry_count: z.number().int().min(0).default(0)
  })
};

// GET /webhooks - Listar webhooks com paginação e ETag
router.get('/', 
  createPaginationMiddleware(['name', 'url', 'created_at', 'updated_at']),
  withETag(async (req, res) => {
    try {
      const { limit, offset, orderBy, order } = res.locals.pagination;
      const orderClause = orderBy ? ` ORDER BY ${orderBy} ${order.toUpperCase()}` : ' ORDER BY created_at DESC';
      
      const total = await db.query('SELECT COUNT(1) AS count FROM webhooks');
      const result = await db.query(
        `SELECT * FROM webhooks${orderClause} LIMIT $1 OFFSET $2`, 
        [limit, offset]
      );
      
      res.set('X-Total-Count', String(total.rows[0].count));
      res.json(result.rows);
    } catch (error) {
      logger.error('Erro ao listar webhooks:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// POST /webhooks - Criar webhook com Idempotency
router.post('/', 
  idempotency(),
  rateLimiters.webhook,
  validate({ body: webhookSchemas.create }),
  async (req, res) => {
    try {
      const { url, name, events, is_active, secret } = req.body;
      
      // Gerar secret se não fornecido
      const webhookSecret = secret || crypto.randomBytes(32).toString('hex');
      
      const result = await db.query(`
        INSERT INTO webhooks (url, name, events, is_active, secret)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, [url, name, JSON.stringify(events), is_active, webhookSecret]);
      
      const webhook = result.rows[0];
      
      await logAudit({ 
        req, 
        action: 'create', 
        resourceType: 'webhook', 
        resourceId: webhook.id,
        newValues: { url, name, events }
      });
      
      res.status(201).json({
        success: true,
        webhook: {
          ...webhook,
          secret: webhookSecret // Retornar apenas na criação
        }
      });
    } catch (error) {
      logger.error('Erro ao criar webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /webhooks/:id - Buscar webhook específico
router.get('/:id', 
  validate({ params: commonSchemas.idParam }),
  withETag(async (req, res) => {
    try {
      const { id } = req.params;
      
      const result = await db.query('SELECT * FROM webhooks WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Webhook não encontrado' });
      }
      
      const webhook = result.rows[0];
      // Não retornar o secret
      delete webhook.secret;
      
      res.json(webhook);
    } catch (error) {
      logger.error('Erro ao buscar webhook:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// PUT /webhooks/:id - Atualizar webhook
router.put('/:id', 
  idempotency(),
  validate({ 
    params: commonSchemas.idParam,
    body: webhookSchemas.update 
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Buscar webhook atual
      const currentResult = await db.query('SELECT * FROM webhooks WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Webhook não encontrado' });
      }
      
      const currentWebhook = currentResult.rows[0];
      
      // Construir query de atualização
      const fields = [];
      const values = [];
      let paramCount = 1;
      
      Object.keys(updateData).forEach(key => {
        if (updateData[key] !== undefined) {
          fields.push(`${key} = $${paramCount}`);
          values.push(key === 'events' ? JSON.stringify(updateData[key]) : updateData[key]);
          paramCount++;
        }
      });
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Nenhum campo para atualizar' });
      }
      
      fields.push(`updated_at = NOW()`);
      values.push(id);
      
      const result = await db.query(`
        UPDATE webhooks 
        SET ${fields.join(', ')}
        WHERE id = $${paramCount}
        RETURNING *
      `, values);
      
      const updatedWebhook = result.rows[0];
      delete updatedWebhook.secret; // Não retornar o secret
      
      await logAudit({ 
        req, 
        action: 'update', 
        resourceType: 'webhook', 
        resourceId: id,
        oldValues: currentWebhook,
        newValues: updatedWebhook
      });
      
      res.json({ success: true, webhook: updatedWebhook });
    } catch (error) {
      logger.error('Erro ao atualizar webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// DELETE /webhooks/:id - Remover webhook
router.delete('/:id', 
  idempotency(),
  validate({ params: commonSchemas.idParam }),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const currentResult = await db.query('SELECT * FROM webhooks WHERE id = $1', [id]);
      if (currentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Webhook não encontrado' });
      }
      
      await db.query('DELETE FROM webhooks WHERE id = $1', [id]);
      
      await logAudit({ 
        req, 
        action: 'delete', 
        resourceType: 'webhook', 
        resourceId: id,
        oldValues: currentResult.rows[0]
      });
      
      res.json({ success: true, message: 'Webhook removido com sucesso' });
    } catch (error) {
      logger.error('Erro ao remover webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// POST /webhooks/:id/test - Testar webhook
router.post('/:id/test', 
  idempotency(),
  validate({ 
    params: commonSchemas.idParam,
    body: webhookSchemas.test 
  }),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { event, payload } = req.body;
      
      const webhookResult = await db.query('SELECT * FROM webhooks WHERE id = $1', [id]);
      if (webhookResult.rows.length === 0) {
        return res.status(404).json({ error: 'Webhook não encontrado' });
      }
      
      const webhook = webhookResult.rows[0];
      
      // Simular envio do webhook
      const testPayload = {
        event,
        timestamp: new Date().toISOString(),
        data: payload || { test: true },
        webhook_id: id
      };
      
      // Gerar assinatura HMAC se secret estiver configurado
      let signature = null;
      if (webhook.secret) {
        signature = crypto
          .createHmac('sha256', webhook.secret)
          .update(JSON.stringify(testPayload))
          .digest('hex');
      }
      
      // Registrar tentativa de entrega
      await db.query(`
        INSERT INTO webhook_deliveries (webhook_id, event, payload, status, response_code, response_body)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        id, 
        event, 
        JSON.stringify(testPayload), 
        'success', 
        200, 
        JSON.stringify({ success: true, message: 'Test delivery' })
      ]);
      
      res.json({
        success: true,
        message: 'Teste de webhook realizado',
        payload: testPayload,
        signature: signature ? `sha256=${signature}` : null
      });
    } catch (error) {
      logger.error('Erro ao testar webhook:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

// GET /webhooks/:id/deliveries - Histórico de entregas
router.get('/:id/deliveries', 
  validate({ params: commonSchemas.idParam }),
  createPaginationMiddleware(['created_at', 'status', 'response_code']),
  withETag(async (req, res) => {
    try {
      const { id } = req.params;
      const { limit, offset, orderBy, order } = res.locals.pagination;
      const orderClause = orderBy ? ` ORDER BY ${orderBy} ${order.toUpperCase()}` : ' ORDER BY created_at DESC';
      
      // Verificar se webhook existe
      const webhookCheck = await db.query('SELECT id FROM webhooks WHERE id = $1', [id]);
      if (webhookCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Webhook não encontrado' });
      }
      
      const total = await db.query('SELECT COUNT(1) AS count FROM webhook_deliveries WHERE webhook_id = $1', [id]);
      const result = await db.query(`
        SELECT * FROM webhook_deliveries 
        WHERE webhook_id = $1${orderClause} 
        LIMIT $2 OFFSET $3
      `, [id, limit, offset]);
      
      res.set('X-Total-Count', String(total.rows[0].count));
      res.json(result.rows);
    } catch (error) {
      logger.error('Erro ao buscar entregas do webhook:', error);
      res.status(500).json({ error: error.message });
    }
  })
);

// POST /webhooks/:id/regenerate-secret - Regenerar secret
router.post('/:id/regenerate-secret', 
  idempotency(),
  validate({ params: commonSchemas.idParam }),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const webhookResult = await db.query('SELECT * FROM webhooks WHERE id = $1', [id]);
      if (webhookResult.rows.length === 0) {
        return res.status(404).json({ error: 'Webhook não encontrado' });
      }
      
      const newSecret = crypto.randomBytes(32).toString('hex');
      
      await db.query('UPDATE webhooks SET secret = $1, updated_at = NOW() WHERE id = $2', [newSecret, id]);
      
      await logAudit({ 
        req, 
        action: 'regenerate_secret', 
        resourceType: 'webhook', 
        resourceId: id
      });
      
      res.json({
        success: true,
        message: 'Secret regenerado com sucesso',
        secret: newSecret
      });
    } catch (error) {
      logger.error('Erro ao regenerar secret:', error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;