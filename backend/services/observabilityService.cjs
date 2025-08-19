const winston = require('winston');
const { Logtail } = require('@logtail/winston');
const logger = require('../logger.cjs');

class ObservabilityService {
  constructor() {
    this.metrics = new Map();
    this.traces = new Map();
    this.setupStructuredLogging();
  }

  /**
   * Configura logging estruturado com Winston
   */
  setupStructuredLogging() {
    // Formato estruturado para logs
    const structuredFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        return JSON.stringify({
          timestamp,
          level,
          message,
          ...meta,
          service: 'saas-platform',
          environment: process.env.NODE_ENV || 'development'
        });
      })
    );

    // Configurar transportes
    const transports = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: structuredFormat
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: structuredFormat
      })
    ];

    // Adicionar Logtail se configurado
    if (process.env.LOGTAIL_TOKEN) {
      transports.push(new Logtail(process.env.LOGTAIL_TOKEN));
    }

    // Criar logger estruturado
    this.structuredLogger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: structuredFormat,
      transports,
      exitOnError: false
    });
  }

  /**
   * Log estruturado com contexto
   */
  log(level, message, context = {}) {
    const logData = {
      message,
      ...context,
      correlationId: this.getCorrelationId(),
      requestId: this.getRequestId()
    };

    this.structuredLogger.log(level, message, logData);
  }

  /**
   * Log de requisição HTTP
   */
  logRequest(req, res, responseTime) {
    const logData = {
      type: 'http_request',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id,
      correlationId: this.getCorrelationId(),
      requestId: this.getRequestId()
    };

    this.structuredLogger.info('HTTP Request', logData);
  }

  /**
   * Log de erro estruturado
   */
  logError(error, context = {}) {
    const logData = {
      type: 'error',
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code
      },
      ...context,
      correlationId: this.getCorrelationId(),
      requestId: this.getRequestId()
    };

    this.structuredLogger.error('Error occurred', logData);
  }

  /**
   * Log de auditoria estruturado
   */
  logAudit(action, resourceType, resourceId, userId, details = {}) {
    const logData = {
      type: 'audit',
      action,
      resourceType,
      resourceId,
      userId,
      timestamp: new Date().toISOString(),
      ...details,
      correlationId: this.getCorrelationId(),
      requestId: this.getRequestId()
    };

    this.structuredLogger.info('Audit event', logData);
  }

  /**
   * Log de performance
   */
  logPerformance(operation, duration, metadata = {}) {
    const logData = {
      type: 'performance',
      operation,
      duration,
      timestamp: new Date().toISOString(),
      ...metadata,
      correlationId: this.getCorrelationId(),
      requestId: this.getRequestId()
    };

    this.structuredLogger.info('Performance metric', logData);
  }

  /**
   * Métricas simples
   */
  incrementMetric(name, value = 1, labels = {}) {
    const key = this.getMetricKey(name, labels);
    const current = this.metrics.get(key) || 0;
    this.metrics.set(key, current + value);

    this.log('info', 'Metric incremented', {
      type: 'metric',
      name,
      value: current + value,
      labels
    });
  }

  /**
   * Histogram de métricas
   */
  recordHistogram(name, value, labels = {}) {
    const key = this.getMetricKey(name, labels);
    const histogram = this.metrics.get(key) || {
      count: 0,
      sum: 0,
      min: Infinity,
      max: -Infinity,
      values: []
    };

    histogram.count++;
    histogram.sum += value;
    histogram.min = Math.min(histogram.min, value);
    histogram.max = Math.max(histogram.max, value);
    histogram.values.push(value);

    // Manter apenas os últimos 100 valores
    if (histogram.values.length > 100) {
      histogram.values = histogram.values.slice(-100);
    }

    this.metrics.set(key, histogram);

    this.log('info', 'Histogram recorded', {
      type: 'histogram',
      name,
      value,
      labels,
      stats: {
        count: histogram.count,
        sum: histogram.sum,
        min: histogram.min,
        max: histogram.max,
        avg: histogram.sum / histogram.count
      }
    });
  }

  /**
   * Gauge de métricas
   */
  setGauge(name, value, labels = {}) {
    const key = this.getMetricKey(name, labels);
    this.metrics.set(key, value);

    this.log('info', 'Gauge set', {
      type: 'gauge',
      name,
      value,
      labels
    });
  }

  /**
   * Obter métricas
   */
  getMetrics() {
    const metrics = {};
    
    for (const [key, value] of this.metrics) {
      const [name, ...labelParts] = key.split('|');
      const labels = {};
      
      for (const part of labelParts) {
        const [k, v] = part.split('=');
        labels[k] = v;
      }
      
      if (!metrics[name]) {
        metrics[name] = [];
      }
      
      metrics[name].push({
        value,
        labels
      });
    }
    
    return metrics;
  }

  /**
   * Tracing distribuído simples
   */
  startTrace(operation, context = {}) {
    const traceId = this.generateTraceId();
    const spanId = this.generateSpanId();
    
    const trace = {
      traceId,
      spanId,
      operation,
      startTime: Date.now(),
      context: {
        ...context,
        correlationId: this.getCorrelationId(),
        requestId: this.getRequestId()
      }
    };
    
    this.traces.set(traceId, trace);
    
    this.log('info', 'Trace started', {
      type: 'trace',
      traceId,
      spanId,
      operation,
      context: trace.context
    });
    
    return traceId;
  }

  /**
   * Finalizar trace
   */
  endTrace(traceId, result = null, error = null) {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const duration = Date.now() - trace.startTime;
    
    const logData = {
      type: 'trace',
      traceId,
      spanId: trace.spanId,
      operation: trace.operation,
      duration,
      result,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      context: trace.context
    };
    
    this.structuredLogger.info('Trace ended', logData);
    this.traces.delete(traceId);
  }

  /**
   * Adicionar span ao trace
   */
  addSpan(traceId, operation, context = {}) {
    const trace = this.traces.get(traceId);
    if (!trace) return;
    
    const spanId = this.generateSpanId();
    
    this.log('info', 'Span added', {
      type: 'span',
      traceId,
      spanId,
      operation,
      context: {
        ...trace.context,
        ...context
      }
    });
    
    return spanId;
  }

  /**
   * Gerar ID de correlação
   */
  getCorrelationId() {
    return process.env.CORRELATION_ID || 'default';
  }

  /**
   * Gerar ID de requisição
   */
  getRequestId() {
    return process.env.REQUEST_ID || 'default';
  }

  /**
   * Gerar chave de métrica
   */
  getMetricKey(name, labels) {
    const labelStr = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join('|');
    
    return labelStr ? `${name}|${labelStr}` : name;
  }

  /**
   * Gerar Trace ID
   */
  generateTraceId() {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gerar Span ID
   */
  generateSpanId() {
    return `span_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Health check do serviço
   */
  async healthCheck() {
    try {
      const metrics = this.getMetrics();
      const activeTraces = this.traces.size;
      
      return {
        status: 'healthy',
        metrics: {
          totalMetrics: Object.keys(metrics).length,
          activeTraces
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new ObservabilityService();