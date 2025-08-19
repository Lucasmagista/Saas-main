const db = require('../postgresClient.cjs');
const logger = require('../logger.cjs');
const observabilityService = require('./observabilityService.cjs');

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtém métricas gerais do sistema
   */
  async getSystemMetrics(timeRange = '24h') {
    const cacheKey = `system_metrics_${timeRange}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      const metrics = await Promise.all([
        this.getUserMetrics(timeFilter),
        this.getBotMetrics(timeFilter),
        this.getMessageMetrics(timeFilter),
        this.getWebhookMetrics(timeFilter),
        this.getPerformanceMetrics(timeFilter)
      ]);

      const result = {
        users: metrics[0],
        bots: metrics[1],
        messages: metrics[2],
        webhooks: metrics[3],
        performance: metrics[4],
        timestamp: new Date().toISOString()
      };

      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      logger.error('Error getting system metrics:', error);
      throw error;
    }
  }

  /**
   * Métricas de usuários
   */
  async getUserMetrics(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new_users,
        COUNT(CASE WHEN last_login >= $1 THEN 1 END) as active_users,
        COUNT(CASE WHEN two_factor_enabled = true THEN 1 END) as users_with_2fa,
        AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/86400) as avg_user_age_days
      FROM users
      WHERE is_active = true
    `, [timeFilter]);

    return result.rows[0];
  }

  /**
   * Métricas de bots
   */
  async getBotMetrics(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_bots,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_bots,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new_bots,
        COUNT(CASE WHEN last_activity >= $1 THEN 1 END) as active_recently,
        AVG(CASE WHEN total_messages > 0 THEN total_messages END) as avg_messages_per_bot
      FROM bots
    `, [timeFilter]);

    return result.rows[0];
  }

  /**
   * Métricas de mensagens
   */
  async getMessageMetrics(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as messages_today,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_messages,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_messages,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_messages,
        AVG(CASE WHEN duration IS NOT NULL THEN duration END) as avg_delivery_time_ms,
        COUNT(CASE WHEN type = 'text' THEN 1 END) as text_messages,
        COUNT(CASE WHEN type = 'media' THEN 1 END) as media_messages,
        COUNT(CASE WHEN type = 'template' THEN 1 END) as template_messages
      FROM messages
      WHERE created_at >= $1
    `, [timeFilter]);

    return result.rows[0];
  }

  /**
   * Métricas de webhooks
   */
  async getWebhookMetrics(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_webhooks,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_webhooks,
        COUNT(CASE WHEN created_at >= $1 THEN 1 END) as new_webhooks
      FROM webhooks
    `, [timeFilter]);

    // Métricas de entregas
    const deliveryResult = await db.query(`
      SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_deliveries,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_deliveries,
        AVG(CASE WHEN duration IS NOT NULL THEN duration END) as avg_delivery_time_ms,
        COUNT(CASE WHEN retry_count > 0 THEN 1 END) as retried_deliveries
      FROM webhook_deliveries
      WHERE created_at >= $1
    `, [timeFilter]);

    return {
      ...result.rows[0],
      deliveries: deliveryResult.rows[0]
    };
  }

  /**
   * Métricas de performance
   */
  async getPerformanceMetrics(timeFilter) {
    // Métricas de performance do sistema
    const systemMetrics = {
      cpu_usage: process.cpuUsage(),
      memory_usage: process.memoryUsage(),
      uptime: process.uptime(),
      active_connections: await this.getActiveConnections()
    };

    // Métricas de performance do banco
    const dbMetrics = await this.getDatabaseMetrics();

    return {
      system: systemMetrics,
      database: dbMetrics
    };
  }

  /**
   * Obtém dados para gráficos de tendência
   */
  async getTrendData(metric, timeRange = '7d', interval = '1d') {
    const cacheKey = `trend_${metric}_${timeRange}_${interval}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let query;
      const timeFilter = this.getTimeFilter(timeRange);

      switch (metric) {
        case 'messages':
          query = `
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as count,
              COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent,
              COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
            FROM messages
            WHERE created_at >= $1
            GROUP BY DATE(created_at)
            ORDER BY date
          `;
          break;

        case 'users':
          query = `
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as new_users,
              COUNT(CASE WHEN last_login >= created_at THEN 1 END) as active_users
            FROM users
            WHERE created_at >= $1
            GROUP BY DATE(created_at)
            ORDER BY date
          `;
          break;

        case 'webhooks':
          query = `
            SELECT 
              DATE(created_at) as date,
              COUNT(*) as total_deliveries,
              COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
              COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed
            FROM webhook_deliveries
            WHERE created_at >= $1
            GROUP BY DATE(created_at)
            ORDER BY date
          `;
          break;

        default:
          throw new Error(`Unknown metric: ${metric}`);
      }

      const result = await db.query(query, [timeFilter]);
      this.setCached(cacheKey, result.rows);
      return result.rows;
    } catch (error) {
      logger.error('Error getting trend data:', error);
      throw error;
    }
  }

  /**
   * Obtém dados para gráficos de distribuição
   */
  async getDistributionData(metric, timeRange = '30d') {
    const cacheKey = `distribution_${metric}_${timeRange}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let query;
      const timeFilter = this.getTimeFilter(timeRange);

      switch (metric) {
        case 'message_types':
          query = `
            SELECT 
              type,
              COUNT(*) as count,
              ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM messages
            WHERE created_at >= $1
            GROUP BY type
            ORDER BY count DESC
          `;
          break;

        case 'message_status':
          query = `
            SELECT 
              status,
              COUNT(*) as count,
              ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM messages
            WHERE created_at >= $1
            GROUP BY status
            ORDER BY count DESC
          `;
          break;

        case 'user_roles':
          query = `
            SELECT 
              role,
              COUNT(*) as count,
              ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
            FROM users
            WHERE is_active = true
            GROUP BY role
            ORDER BY count DESC
          `;
          break;

        default:
          throw new Error(`Unknown distribution metric: ${metric}`);
      }

      const result = await db.query(query, [timeFilter]);
      this.setCached(cacheKey, result.rows);
      return result.rows;
    } catch (error) {
      logger.error('Error getting distribution data:', error);
      throw error;
    }
  }

  /**
   * Obtém top performers
   */
  async getTopPerformers(category, timeRange = '30d', limit = 10) {
    const cacheKey = `top_${category}_${timeRange}_${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      let query;
      const timeFilter = this.getTimeFilter(timeRange);

      switch (category) {
        case 'bots':
          query = `
            SELECT 
              b.name,
              b.id,
              COUNT(m.id) as message_count,
              COUNT(CASE WHEN m.status = 'sent' THEN 1 END) as sent_count,
              ROUND(COUNT(CASE WHEN m.status = 'sent' THEN 1 END) * 100.0 / COUNT(m.id), 2) as success_rate
            FROM bots b
            LEFT JOIN messages m ON b.id = m.bot_id AND m.created_at >= $1
            WHERE b.is_active = true
            GROUP BY b.id, b.name
            ORDER BY message_count DESC
            LIMIT $2
          `;
          break;

        case 'users':
          query = `
            SELECT 
              u.name,
              u.email,
              COUNT(m.id) as message_count,
              COUNT(CASE WHEN m.status = 'sent' THEN 1 END) as sent_count,
              u.last_login
            FROM users u
            LEFT JOIN messages m ON u.id = m.created_by AND m.created_at >= $1
            WHERE u.is_active = true
            GROUP BY u.id, u.name, u.email, u.last_login
            ORDER BY message_count DESC
            LIMIT $2
          `;
          break;

        case 'webhooks':
          query = `
            SELECT 
              w.name,
              w.url,
              COUNT(wd.id) as delivery_count,
              COUNT(CASE WHEN wd.status = 'success' THEN 1 END) as success_count,
              ROUND(COUNT(CASE WHEN wd.status = 'success' THEN 1 END) * 100.0 / COUNT(wd.id), 2) as success_rate
            FROM webhooks w
            LEFT JOIN webhook_deliveries wd ON w.id = wd.webhook_id AND wd.created_at >= $1
            WHERE w.is_active = true
            GROUP BY w.id, w.name, w.url
            ORDER BY delivery_count DESC
            LIMIT $2
          `;
          break;

        default:
          throw new Error(`Unknown category: ${category}`);
      }

      const result = await db.query(query, [timeFilter, limit]);
      this.setCached(cacheKey, result.rows);
      return result.rows;
    } catch (error) {
      logger.error('Error getting top performers:', error);
      throw error;
    }
  }

  /**
   * Obtém alertas e anomalias
   */
  async getAlerts(timeRange = '24h') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      const alerts = [];

      // Verificar taxa de falha de mensagens
      const messageFailureRate = await this.getMessageFailureRate(timeFilter);
      if (messageFailureRate > 0.1) { // 10%
        alerts.push({
          type: 'high_message_failure_rate',
          severity: 'warning',
          message: `Taxa de falha de mensagens alta: ${(messageFailureRate * 100).toFixed(1)}%`,
          value: messageFailureRate
        });
      }

      // Verificar taxa de falha de webhooks
      const webhookFailureRate = await this.getWebhookFailureRate(timeFilter);
      if (webhookFailureRate > 0.05) { // 5%
        alerts.push({
          type: 'high_webhook_failure_rate',
          severity: 'warning',
          message: `Taxa de falha de webhooks alta: ${(webhookFailureRate * 100).toFixed(1)}%`,
          value: webhookFailureRate
        });
      }

      // Verificar performance do banco
      const dbPerformance = await this.getDatabasePerformance();
      if (dbPerformance.avg_query_time > 1000) { // 1 segundo
        alerts.push({
          type: 'slow_database_queries',
          severity: 'error',
          message: `Consultas lentas detectadas: ${dbPerformance.avg_query_time.toFixed(0)}ms`,
          value: dbPerformance.avg_query_time
        });
      }

      return alerts;
    } catch (error) {
      logger.error('Error getting alerts:', error);
      return [];
    }
  }

  /**
   * Métricas derivadas avançadas
   */
  async getDerivedMetrics(timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange);
      
      // Engajamento de usuários
      const userEngagement = await this.calculateUserEngagement(timeFilter);
      
      // Eficiência de bots
      const botEfficiency = await this.calculateBotEfficiency(timeFilter);
      
      // Qualidade de entrega
      const deliveryQuality = await this.calculateDeliveryQuality(timeFilter);
      
      // ROI estimado
      const estimatedROI = await this.calculateEstimatedROI(timeRange);

      return {
        userEngagement,
        botEfficiency,
        deliveryQuality,
        estimatedROI,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Error calculating derived metrics:', error);
      throw error;
    }
  }

  // Métodos auxiliares
  getTimeFilter(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now - 60 * 60 * 1000);
      case '24h': return new Date(now - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now - 30 * 24 * 60 * 60 * 1000);
      case '90d': return new Date(now - 90 * 24 * 60 * 60 * 1000);
      default: return new Date(now - 24 * 60 * 60 * 1000);
    }
  }

  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  async getActiveConnections() {
    // Implementação básica - em produção usar métricas reais
    return Math.floor(Math.random() * 100) + 10;
  }

  async getDatabaseMetrics() {
    // Implementação básica - em produção usar pg_stat_statements
    return {
      connections: await this.getActiveConnections(),
      queries_per_second: Math.floor(Math.random() * 1000) + 100,
      avg_query_time: Math.floor(Math.random() * 100) + 10
    };
  }

  async getMessageFailureRate(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'failed' THEN 1 END) * 1.0 / COUNT(*) as failure_rate
      FROM messages
      WHERE created_at >= $1
    `, [timeFilter]);
    
    return result.rows[0]?.failure_rate || 0;
  }

  async getWebhookFailureRate(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(CASE WHEN status = 'failed' THEN 1 END) * 1.0 / COUNT(*) as failure_rate
      FROM webhook_deliveries
      WHERE created_at >= $1
    `, [timeFilter]);
    
    return result.rows[0]?.failure_rate || 0;
  }

  async getDatabasePerformance() {
    // Implementação básica
    return {
      avg_query_time: Math.floor(Math.random() * 500) + 50,
      slow_queries: Math.floor(Math.random() * 10)
    };
  }

  async calculateUserEngagement(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT CASE WHEN m.created_at >= $1 THEN m.created_by END) as active_users,
        COUNT(DISTINCT CASE WHEN u.last_login >= $1 THEN u.id END) as logged_users
      FROM users u
      LEFT JOIN messages m ON u.id = m.created_by
      WHERE u.is_active = true
    `, [timeFilter]);

    const data = result.rows[0];
    return {
      activeRate: data.total_users > 0 ? data.active_users / data.total_users : 0,
      loginRate: data.total_users > 0 ? data.logged_users / data.total_users : 0,
      totalUsers: data.total_users,
      activeUsers: data.active_users
    };
  }

  async calculateBotEfficiency(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(DISTINCT b.id) as total_bots,
        COUNT(DISTINCT CASE WHEN m.id IS NOT NULL THEN b.id END) as bots_with_messages,
        AVG(CASE WHEN m.id IS NOT NULL THEN m.total_messages END) as avg_messages_per_bot
      FROM bots b
      LEFT JOIN messages m ON b.id = m.bot_id AND m.created_at >= $1
      WHERE b.is_active = true
    `, [timeFilter]);

    const data = result.rows[0];
    return {
      utilizationRate: data.total_bots > 0 ? data.bots_with_messages / data.total_bots : 0,
      avgMessagesPerBot: data.avg_messages_per_bot || 0,
      totalBots: data.total_bots,
      activeBots: data.bots_with_messages
    };
  }

  async calculateDeliveryQuality(timeFilter) {
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status = 'success' THEN 1 END) as successful,
        AVG(CASE WHEN duration IS NOT NULL THEN duration END) as avg_delivery_time,
        COUNT(CASE WHEN retry_count > 0 THEN 1 END) as retried
      FROM webhook_deliveries
      WHERE created_at >= $1
    `, [timeFilter]);

    const data = result.rows[0];
    return {
      successRate: data.total_deliveries > 0 ? data.successful / data.total_deliveries : 0,
      avgDeliveryTime: data.avg_delivery_time || 0,
      retryRate: data.total_deliveries > 0 ? data.retried / data.total_deliveries : 0,
      totalDeliveries: data.total_deliveries
    };
  }

  async calculateEstimatedROI(timeRange) {
    // Implementação básica - em produção usar dados reais de custos e receita
    const messages = await this.getMessageMetrics(this.getTimeFilter(timeRange));
    const estimatedCostPerMessage = 0.001; // $0.001 por mensagem
    const estimatedRevenuePerMessage = 0.005; // $0.005 por mensagem
    
    const totalCost = messages.total_messages * estimatedCostPerMessage;
    const totalRevenue = messages.sent_messages * estimatedRevenuePerMessage;
    const roi = totalCost > 0 ? (totalRevenue - totalCost) / totalCost : 0;

    return {
      totalCost,
      totalRevenue,
      roi,
      profit: totalRevenue - totalCost
    };
  }
}

module.exports = new AnalyticsService();