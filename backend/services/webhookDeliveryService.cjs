const crypto = require('crypto');
const fetch = require('node-fetch');
const db = require('../postgresClient.cjs');
const logger = require('../logger.cjs');
const queueService = require('./queueService.cjs');
const observabilityService = require('./observabilityService.cjs');

class WebhookDeliveryService {
  constructor() {
    this.circuitBreakers = new Map();
    this.maxRetries = 5;
    this.retryDelays = [1000, 2000, 5000, 10000, 30000]; // Delays em ms
    this.timeout = 10000; // 10 segundos
    this.circuitBreakerThreshold = 5; // Falhas para abrir circuito
    this.circuitBreakerTimeout = 60000; // 1 minuto para fechar
  }

  /**
   * Envia webhook com retry e circuit breaker
   */
  async deliverWebhook(webhookId, event, payload, signature = null) {
    const traceId = observabilityService.startTrace('webhook_delivery', {
      webhookId,
      event,
      payloadSize: JSON.stringify(payload).length
    });

    try {
      // Buscar configuração do webhook
      const webhook = await this.getWebhook(webhookId);
      if (!webhook || !webhook.is_active) {
        throw new Error('Webhook não encontrado ou inativo');
      }

      // Verificar circuit breaker
      const circuitBreaker = this.getCircuitBreaker(webhook.url);
      if (circuitBreaker.isOpen()) {
        throw new Error('Circuit breaker aberto para este webhook');
      }

      // Criar registro de entrega
      const deliveryId = await this.createDeliveryRecord(webhookId, event, payload);

      // Preparar payload com assinatura
      const finalPayload = this.preparePayload(event, payload, webhookId);
      const headers = this.prepareHeaders(webhook, signature);

      // Enviar webhook
      const startTime = Date.now();
      const response = await this.sendWebhook(webhook.url, finalPayload, headers);
      const duration = Date.now() - startTime;

      // Registrar sucesso
      await this.updateDeliveryRecord(deliveryId, {
        status: 'success',
        responseCode: response.status,
        responseBody: response.body,
        responseHeaders: response.headers,
        sentAt: new Date(),
        duration
      });

      // Registrar sucesso no circuit breaker
      circuitBreaker.recordSuccess();

      // Log de sucesso
      observabilityService.log('info', 'Webhook delivered successfully', {
        webhookId,
        deliveryId,
        event,
        duration,
        responseCode: response.status
      });

      observabilityService.endTrace(traceId, { success: true, duration });

      return {
        success: true,
        deliveryId,
        responseCode: response.status,
        duration
      };

    } catch (error) {
      // Registrar falha
      await this.handleDeliveryFailure(webhookId, event, payload, error);

      // Registrar falha no circuit breaker
      const circuitBreaker = this.getCircuitBreaker(webhook.url);
      circuitBreaker.recordFailure();

      observabilityService.logError(error, {
        webhookId,
        event,
        operation: 'webhook_delivery'
      });

      observabilityService.endTrace(traceId, null, error);

      throw error;
    }
  }

  /**
   * Envia webhook com retry automático
   */
  async sendWebhook(url, payload, headers) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SaaS-Platform-Webhook/1.0',
        ...headers
      },
      body: JSON.stringify(payload),
      timeout: this.timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const responseBody = await response.text();
    const responseHeaders = Object.fromEntries(response.headers.entries());

    return {
      status: response.status,
      body: responseBody,
      headers: responseHeaders
    };
  }

  /**
   * Processa webhooks da fila
   */
  async processWebhookQueue(job) {
    const { webhookId, event, payload, signature, retryCount = 0 } = job.data;

    try {
      await this.deliverWebhook(webhookId, event, payload, signature);
    } catch (error) {
      // Se ainda há tentativas, reagendar
      if (retryCount < this.maxRetries) {
        const delay = this.retryDelays[retryCount] || this.retryDelays[this.retryDelays.length - 1];
        
        await queueService.addJob('webhooks', 'retry', {
          webhookId,
          event,
          payload,
          signature,
          retryCount: retryCount + 1
        }, {
          delay
        });

        logger.info('Webhook queued for retry', {
          webhookId,
          retryCount: retryCount + 1,
          delay
        });
      } else {
        // Máximo de tentativas atingido, enviar para DLQ
        await this.sendToDLQ(webhookId, event, payload, signature, error);
      }
    }
  }

  /**
   * Envia para Dead Letter Queue
   */
  async sendToDLQ(webhookId, event, payload, signature, error) {
    try {
      await db.query(`
        INSERT INTO webhook_dlq (webhook_id, event, payload, signature, error_message, failed_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [webhookId, event, JSON.stringify(payload), signature, error.message]);

      observabilityService.incrementMetric('webhook_dlq_entries', 1, { webhookId, event });

      logger.error('Webhook sent to DLQ', {
        webhookId,
        event,
        error: error.message
      });
    } catch (dlqError) {
      logger.error('Error sending to DLQ', dlqError);
    }
  }

  /**
   * Reprocessa webhooks da DLQ
   */
  async reprocessDLQ(webhookId = null, limit = 10) {
    try {
      let query = `
        SELECT * FROM webhook_dlq 
        WHERE reprocessed = false
      `;
      const params = [];

      if (webhookId) {
        query += ` AND webhook_id = $1`;
        params.push(webhookId);
      }

      query += ` ORDER BY failed_at ASC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await db.query(query, params);

      for (const dlqEntry of result.rows) {
        try {
          await this.deliverWebhook(
            dlqEntry.webhook_id,
            dlqEntry.event,
            JSON.parse(dlqEntry.payload),
            dlqEntry.signature
          );

          // Marcar como reprocessado
          await db.query(`
            UPDATE webhook_dlq 
            SET reprocessed = true, reprocessed_at = NOW()
            WHERE id = $1
          `, [dlqEntry.id]);

          logger.info('DLQ entry reprocessed successfully', {
            dlqEntryId: dlqEntry.id,
            webhookId: dlqEntry.webhook_id
          });

        } catch (error) {
          logger.error('Error reprocessing DLQ entry', {
            dlqEntryId: dlqEntry.id,
            error: error.message
          });
        }
      }

      return result.rows.length;
    } catch (error) {
      logger.error('Error reprocessing DLQ', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de entrega
   */
  async getDeliveryStats(webhookId = null, timeRange = '24h') {
    try {
      let whereClause = '';
      const params = [];

      if (webhookId) {
        whereClause = 'WHERE webhook_id = $1';
        params.push(webhookId);
      }

      if (timeRange) {
        const timeFilter = timeRange === '24h' ? 'created_at >= NOW() - INTERVAL \'24 hours\'' :
                          timeRange === '7d' ? 'created_at >= NOW() - INTERVAL \'7 days\'' :
                          timeRange === '30d' ? 'created_at >= NOW() - INTERVAL \'30 days\'' : '';

        if (timeFilter) {
          whereClause += whereClause ? ` AND ${timeFilter}` : `WHERE ${timeFilter}`;
        }
      }

      const result = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          AVG(CASE WHEN duration IS NOT NULL THEN duration END) as avg_duration,
          MAX(CASE WHEN duration IS NOT NULL THEN duration END) as max_duration,
          MIN(CASE WHEN duration IS NOT NULL THEN duration END) as min_duration
        FROM webhook_deliveries
        ${whereClause}
      `, params);

      return result.rows[0];
    } catch (error) {
      logger.error('Error getting delivery stats', error);
      throw error;
    }
  }

  /**
   * Obtém webhook por ID
   */
  async getWebhook(webhookId) {
    const result = await db.query('SELECT * FROM webhooks WHERE id = $1', [webhookId]);
    return result.rows[0];
  }

  /**
   * Cria registro de entrega
   */
  async createDeliveryRecord(webhookId, event, payload) {
    const result = await db.query(`
      INSERT INTO webhook_deliveries (webhook_id, event, payload, status)
      VALUES ($1, $2, $3, 'pending')
      RETURNING id
    `, [webhookId, event, JSON.stringify(payload)]);

    return result.rows[0].id;
  }

  /**
   * Atualiza registro de entrega
   */
  async updateDeliveryRecord(deliveryId, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');

    await db.query(`
      UPDATE webhook_deliveries 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
    `, [deliveryId, ...values]);
  }

  /**
   * Trata falha de entrega
   */
  async handleDeliveryFailure(webhookId, event, payload, error) {
    const deliveryId = await this.createDeliveryRecord(webhookId, event, payload);
    
    await this.updateDeliveryRecord(deliveryId, {
      status: 'failed',
      errorMessage: error.message,
      retryCount: 1
    });

    observabilityService.incrementMetric('webhook_delivery_failures', 1, { webhookId, event });
  }

  /**
   * Prepara payload do webhook
   */
  preparePayload(event, payload, webhookId) {
    return {
      event,
      timestamp: new Date().toISOString(),
      data: payload,
      webhook_id: webhookId,
      id: crypto.randomUUID()
    };
  }

  /**
   * Prepara headers do webhook
   */
  prepareHeaders(webhook, signature) {
    const headers = {};

    if (webhook.secret) {
      const payload = JSON.stringify(this.preparePayload('test', {}, webhook.id));
      const hmac = crypto.createHmac('sha256', webhook.secret);
      hmac.update(payload);
      headers['X-Webhook-Signature'] = `sha256=${hmac.digest('hex')}`;
    }

    if (signature) {
      headers['X-Webhook-Signature'] = signature;
    }

    headers['X-Webhook-Timestamp'] = Date.now().toString();

    return headers;
  }

  /**
   * Obtém circuit breaker para URL
   */
  getCircuitBreaker(url) {
    if (!this.circuitBreakers.has(url)) {
      this.circuitBreakers.set(url, new CircuitBreaker(
        this.circuitBreakerThreshold,
        this.circuitBreakerTimeout
      ));
    }
    return this.circuitBreakers.get(url);
  }
}

/**
 * Implementação simples de Circuit Breaker
 */
class CircuitBreaker {
  constructor(failureThreshold, timeout) {
    this.failureThreshold = failureThreshold;
    this.timeout = timeout;
    this.failures = 0;
    this.lastFailureTime = null;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
  }

  isOpen() {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  recordFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

module.exports = new WebhookDeliveryService();