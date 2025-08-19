/*
 * Middleware genérico de validação utilizando zod. Este módulo permite
 * validar `req.body`, `req.query` e `req.params` com esquemas Zod
 * antes de chegar na rota. Se a validação falhar, a requisição
 * é respondida imediatamente com status 400 e detalhes do erro.
 */

const { z } = require('zod');
const logger = require('../logger.cjs');

/**
 * Middleware de validação com Zod para 100% das rotas.
 * Suporta validação de body, query, params e headers.
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      // Validar body
      if (schemas.body) {
        const result = schemas.body.safeParse(req.body);
        if (!result.success) {
          return res.status(400).json({
            error: 'Dados inválidos',
            details: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        req.body = result.data;
      }

      // Validar query
      if (schemas.query) {
        const result = schemas.query.safeParse(req.query);
        if (!result.success) {
          return res.status(400).json({
            error: 'Parâmetros de query inválidos',
            details: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        req.query = result.data;
      }

      // Validar params
      if (schemas.params) {
        const result = schemas.params.safeParse(req.params);
        if (!result.success) {
          return res.status(400).json({
            error: 'Parâmetros de rota inválidos',
            details: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        req.params = result.data;
      }

      // Validar headers
      if (schemas.headers) {
        const result = schemas.headers.safeParse(req.headers);
        if (!result.success) {
          return res.status(400).json({
            error: 'Headers inválidos',
            details: result.error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          });
        }
        req.headers = result.data;
      }

      next();
    } catch (error) {
      logger.error('Validation middleware error:', error);
      res.status(500).json({ error: 'Erro interno de validação' });
    }
  };
}

/**
 * Schemas comuns reutilizáveis
 */
const commonSchemas = {
  // Parâmetros de ID
  idParam: z.object({
    id: z.string().uuid('ID inválido')
  }),

  // Paginação padrão
  pagination: z.object({
    limit: z.coerce.number().int().positive().max(1000).default(20),
    offset: z.coerce.number().int().nonnegative().default(0),
    orderBy: z.string().optional(),
    order: z.enum(['asc', 'desc']).optional().default('asc')
  }),

  // Filtros de data
  dateFilters: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    dateField: z.enum(['created_at', 'updated_at']).optional().default('created_at')
  }),

  // Busca por texto
  search: z.object({
    q: z.string().min(1).max(100).optional(),
    fields: z.array(z.string()).optional()
  }),

  // Status ativo/inativo
  status: z.object({
    is_active: z.coerce.boolean().optional()
  }),

  // Headers de autenticação
  authHeaders: z.object({
    authorization: z.string().regex(/^Bearer\s+/).optional(),
    'idempotency-key': z.string().optional(),
    'if-none-match': z.string().optional()
  }),

  // Headers de webhook
  webhookHeaders: z.object({
    'x-webhook-signature': z.string().optional(),
    'x-webhook-timestamp': z.string().optional(),
    'content-type': z.string().includes('application/json').optional()
  })
};

/**
 * Schemas específicos por entidade
 */
const entitySchemas = {
  // Bot schemas
  bot: {
    create: z.object({
      name: z.string().min(1, 'Nome é obrigatório').max(100),
      type: z.string().min(1, 'Tipo é obrigatório'),
      config: z.any().optional(),
      description: z.string().max(500).optional()
    }),
    update: z.object({
      name: z.string().min(1).max(100).optional(),
      type: z.string().min(1).optional(),
      config: z.any().optional(),
      description: z.string().max(500).optional(),
      is_active: z.boolean().optional()
    }),
    import: z.object({
      url: z.string().url('URL inválida').optional(),
      name: z.string().max(100).optional(),
      description: z.string().max(500).optional()
    })
  },

  // Webhook schemas
  webhook: {
    create: z.object({
      url: z.string().url('URL inválida'),
      name: z.string().min(1).max(100),
      events: z.array(z.string()).min(1),
      is_active: z.boolean().default(true),
      secret: z.string().min(16).optional()
    }),
    update: z.object({
      url: z.string().url().optional(),
      name: z.string().min(1).max(100).optional(),
      events: z.array(z.string()).optional(),
      is_active: z.boolean().optional(),
      secret: z.string().min(16).optional()
    })
  },

  // User schemas
  user: {
    create: z.object({
      name: z.string().min(1).max(100),
      email: z.string().email('Email inválido'),
      password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
      role: z.enum(['user', 'admin', 'moderator']).default('user')
    }),
    update: z.object({
      name: z.string().min(1).max(100).optional(),
      email: z.string().email().optional(),
      role: z.enum(['user', 'admin', 'moderator']).optional(),
      is_active: z.boolean().optional()
    })
  },

  // Message schemas
  message: {
    create: z.object({
      bot_id: z.string().uuid(),
      content: z.string().min(1).max(1000),
      type: z.enum(['text', 'media', 'template']).default('text'),
      metadata: z.any().optional()
    }),
    send: z.object({
      to: z.string().min(1),
      content: z.string().min(1).max(1000),
      type: z.enum(['text', 'media', 'template']).default('text'),
      metadata: z.any().optional()
    })
  }
};

module.exports = { validate, commonSchemas, entitySchemas };
