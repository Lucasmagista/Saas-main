const redis = require('../services/redisService.cjs');

/**
 * Middleware para Idempotency-Key em POST/PUT sensíveis.
 * Armazena a chave por TTL curto para evitar reprocessamento.
 */
function idempotency(ttlSeconds = 300) {
  return async (req, res, next) => {
    try {
      if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();
      const key = req.headers['idempotency-key'];
      if (!key || typeof key !== 'string') return next();
      const redisKey = `idem:${key}`;
      const exists = await redis.exists(redisKey);
      if (exists) {
        return res.status(409).json({ error: 'Operação já processada (Idempotency-Key)' });
      }
      // Marca antes de processar; em caso de erro, ainda evita duplicação
      await redis.set(redisKey, '1', ttlSeconds);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { idempotency };

