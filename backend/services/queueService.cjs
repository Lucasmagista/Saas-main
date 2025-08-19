const { Queue, Worker, QueueScheduler } = require('bullmq');
const Redis = require('ioredis');
const logger = require('../logger.cjs');
const config = require('../config.cjs');

class QueueService {
  constructor() {
    this.redis = new Redis(config.redisUrl);
    this.queues = new Map();
    this.workers = new Map();
    this.schedulers = new Map();
  }

  /**
   * Cria ou obtém uma fila
   */
  getQueue(name, options = {}) {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.redis,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        },
        ...options
      });

      this.queues.set(name, queue);
      logger.info(`Queue created: ${name}`);
    }

    return this.queues.get(name);
  }

  /**
   * Adiciona job à fila
   */
  async addJob(queueName, jobType, data, options = {}) {
    try {
      const queue = this.getQueue(queueName);
      const job = await queue.add(jobType, data, {
        ...options,
        jobId: options.jobId || `${jobType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      logger.info(`Job added to queue ${queueName}:`, { 
        jobId: job.id, 
        type: jobType,
        data: data 
      });

      return job;
    } catch (error) {
      logger.error(`Error adding job to queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Cria worker para processar jobs
   */
  createWorker(queueName, processor, options = {}) {
    if (this.workers.has(queueName)) {
      logger.warn(`Worker already exists for queue: ${queueName}`);
      return this.workers.get(queueName);
    }

    const worker = new Worker(queueName, processor, {
      connection: this.redis,
      concurrency: options.concurrency || 5,
      ...options
    });

    // Event handlers
    worker.on('completed', (job) => {
      logger.info(`Job completed: ${job.id}`, { 
        queue: queueName, 
        type: job.name,
        duration: Date.now() - job.timestamp 
      });
    });

    worker.on('failed', (job, err) => {
      logger.error(`Job failed: ${job.id}`, { 
        queue: queueName, 
        type: job.name,
        error: err.message,
        attempts: job.attemptsMade 
      });
    });

    worker.on('error', (err) => {
      logger.error(`Worker error in ${queueName}:`, err);
    });

    this.workers.set(queueName, worker);
    logger.info(`Worker created for queue: ${queueName}`);

    return worker;
  }

  /**
   * Cria scheduler para jobs agendados
   */
  createScheduler(queueName) {
    if (this.schedulers.has(queueName)) {
      return this.schedulers.get(queueName);
    }

    const scheduler = new QueueScheduler(queueName, {
      connection: this.redis
    });

    this.schedulers.set(queueName, scheduler);
    logger.info(`Scheduler created for queue: ${queueName}`);

    return scheduler;
  }

  /**
   * Obtém status da fila
   */
  async getQueueStatus(queueName) {
    try {
      const queue = this.getQueue(queueName);
      const [waiting, active, completed, failed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed()
      ]);

      return {
        name: queueName,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total: waiting.length + active.length + completed.length + failed.length
      };
    } catch (error) {
      logger.error(`Error getting queue status for ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Limpa fila
   */
  async cleanQueue(queueName, grace = 1000 * 60 * 60 * 24) { // 24 horas
    try {
      const queue = this.getQueue(queueName);
      await queue.clean(grace, 'completed');
      await queue.clean(grace, 'failed');
      logger.info(`Queue cleaned: ${queueName}`);
    } catch (error) {
      logger.error(`Error cleaning queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Pausa worker
   */
  async pauseWorker(queueName) {
    try {
      const worker = this.workers.get(queueName);
      if (worker) {
        await worker.pause();
        logger.info(`Worker paused: ${queueName}`);
      }
    } catch (error) {
      logger.error(`Error pausing worker ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Resume worker
   */
  async resumeWorker(queueName) {
    try {
      const worker = this.workers.get(queueName);
      if (worker) {
        await worker.resume();
        logger.info(`Worker resumed: ${queueName}`);
      }
    } catch (error) {
      logger.error(`Error resuming worker ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Fecha todas as conexões
   */
  async close() {
    try {
      // Fechar workers
      for (const [name, worker] of this.workers) {
        await worker.close();
        logger.info(`Worker closed: ${name}`);
      }

      // Fechar schedulers
      for (const [name, scheduler] of this.schedulers) {
        await scheduler.close();
        logger.info(`Scheduler closed: ${name}`);
      }

      // Fechar filas
      for (const [name, queue] of this.queues) {
        await queue.close();
        logger.info(`Queue closed: ${name}`);
      }

      // Fechar conexão Redis
      await this.redis.quit();
      logger.info('Queue service closed');
    } catch (error) {
      logger.error('Error closing queue service:', error);
      throw error;
    }
  }
}

// Instância singleton
const queueService = new QueueService();

// Processadores específicos para diferentes tipos de jobs
const messageProcessor = async (job) => {
  const { botId, to, content, type, metadata } = job.data;
  
  try {
    logger.info(`Processing message job: ${job.id}`, { botId, to, type });
    
    // TODO: Implementar envio real da mensagem via WPPConnect
    // Por enquanto, simular processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    logger.info(`Message sent successfully: ${job.id}`);
    return { success: true, messageId: `msg_${Date.now()}` };
  } catch (error) {
    logger.error(`Error processing message job ${job.id}:`, error);
    throw error;
  }
};

const webhookProcessor = async (job) => {
  const { webhookId, event, payload, signature } = job.data;
  
  try {
    logger.info(`Processing webhook job: ${job.id}`, { webhookId, event });
    
    // TODO: Implementar envio real do webhook
    // Por enquanto, simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    logger.info(`Webhook sent successfully: ${job.id}`);
    return { success: true, responseCode: 200 };
  } catch (error) {
    logger.error(`Error processing webhook job ${job.id}:`, error);
    throw error;
  }
};

// Inicializar workers
queueService.createWorker('messages', messageProcessor, { concurrency: 3 });
queueService.createWorker('webhooks', webhookProcessor, { concurrency: 5 });

// Inicializar schedulers
queueService.createScheduler('messages');
queueService.createScheduler('webhooks');

module.exports = queueService;