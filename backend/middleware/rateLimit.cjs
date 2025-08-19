const redis = require('../services/redisService.cjs');
const logger = require('../logger.cjs');

/**
 * Rate limiting por usuário/chave usando Redis.
 * Suporta diferentes limites por rota e método.
 */
function createRateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutos
    max = 100, // máximo de requisições por janela
    keyGenerator = (req) => {
      // Por padrão, usa IP + user_id se autenticado
      const userKey = req.user?.id || 'anonymous';
      return `rate_limit:${req.ip}:${userKey}:${req.path}`;
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.',
    statusCode = 429
  } = options;

  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);
      const now = Date.now();
      const windowStart = now - windowMs;

      // Buscar requisições na janela atual
      const requests = await redis.zrangebyscore(key, windowStart, '+inf');
      
      if (requests.length >= max) {
        logger.warn('Rate limit exceeded', { 
          key, 
          ip: req.ip, 
          userId: req.user?.id,
          path: req.path 
        });
        
        return res.status(statusCode).json({ 
          error: message,
          retryAfter: Math.ceil(windowMs / 1000)
        });
      }

      // Adicionar requisição atual
      await redis.zadd(key, now, `${now}-${Math.random()}`);
      await redis.expire(key, Math.ceil(windowMs / 1000));

      // Adicionar headers de rate limit
      res.set('X-RateLimit-Limit', String(max));
      res.set('X-RateLimit-Remaining', String(Math.max(0, max - requests.length - 1)));
      res.set('X-RateLimit-Reset', String(Math.ceil((windowStart + windowMs) / 1000)));

      // Pular contagem se configurado
      if ((skipSuccessfulRequests && res.statusCode < 400) ||
          (skipFailedRequests && res.statusCode >= 400)) {
        return next();
      }

      next();
    } catch (error) {
      logger.error('Rate limiter error', { error: error.message });
      // Em caso de erro no Redis, permitir a requisição
      next();
    }
  };
}

/**
 * Rate limiters específicos para diferentes tipos de rota
 */
const rateLimiters = {
  // Rate limit padrão para APIs
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100
  }),

  // Rate limit mais restritivo para autenticação
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5,
    message: 'Too many authentication attempts, please try again later.'
  }),

  // Rate limit para webhooks
  webhook: createRateLimiter({
    windowMs: 60 * 1000, // 1 minuto
    max: 30,
    keyGenerator: (req) => `rate_limit:webhook:${req.ip}:${req.path}`
  }),

  // Rate limit para criação de bots
  botCreation: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 10,
    keyGenerator: (req) => `rate_limit:bot_creation:${req.user?.id || req.ip}`
  }),

  // Rate limit para uploads
  upload: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 20,
    keyGenerator: (req) => `rate_limit:upload:${req.user?.id || req.ip}`
  })
};

module.exports = { createRateLimiter, rateLimiters };