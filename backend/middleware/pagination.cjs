const { z } = require('zod');

const paginationSchema = z.object({
  limit: z.coerce.number().int().positive().max(1000).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
  orderBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('asc'),
});

/**
 * Middleware de paginação/ordenação/filtros básicos.
 * Aceita ?limit, ?offset, ?orderBy, ?order. orderBy é validado por whitelist por rota.
 * Configure a whitelist via req.paginationAllowedFields no handler antes do middleware, ou
 * passando um array ao criar o middleware.
 */
function createPaginationMiddleware(allowedFields = []) {
  return (req, res, next) => {
    try {
      const parsed = paginationSchema.safeParse(req.query);
      if (!parsed.success) {
        return res.status(400).json({ error: 'Parâmetros de paginação inválidos' });
      }

      const { limit, offset, orderBy, order } = parsed.data;
      const allowed = req.paginationAllowedFields || allowedFields || [];
      let safeOrderBy = undefined;

      if (orderBy) {
        if (!allowed.includes(orderBy)) {
          return res.status(400).json({ error: `Campo de ordenação inválido. Permitidos: ${allowed.join(', ')}` });
        }
        safeOrderBy = orderBy;
      }

      res.locals.pagination = { limit, offset, orderBy: safeOrderBy, order };
      next();
    } catch (error) {
      return res.status(400).json({ error: 'Parâmetros de paginação inválidos' });
    }
  };
}

module.exports = { createPaginationMiddleware };

