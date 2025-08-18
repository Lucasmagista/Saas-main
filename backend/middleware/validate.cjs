/*
 * Middleware genérico de validação utilizando zod. Este módulo permite
 * validar `req.body`, `req.query` e `req.params` com esquemas Zod
 * antes de chegar na rota. Se a validação falhar, a requisição
 * é respondida imediatamente com status 400 e detalhes do erro.
 */

const { ZodError } = require('zod');

/**
 * Cria um middleware de validação. Recebe um objeto contendo
 * opcionalmente os esquemas `body`, `query` e `params` e aplica
 * a validação sobre `req.body`, `req.query` e `req.params`. Os
 * valores validados são atribuídos de volta aos mesmos campos.
 *
 * @param {{ body?: import('zod').ZodTypeAny, query?: import('zod').ZodTypeAny, params?: import('zod').ZodTypeAny }} schemas
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({ error: 'ValidationError', details: err.errors });
      }
      return next(err);
    }
  };
}

module.exports = validate;
