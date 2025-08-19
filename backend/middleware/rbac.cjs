const rbacService = require('../services/rbacService.cjs');
const logger = require('../logger.cjs');

/**
 * Middleware para verificar permissões RBAC/ABAC
 */
function authorizeResource(resource, action, contextExtractor = null) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Extrair contexto adicional se fornecido
      let context = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString()
      };

      if (contextExtractor) {
        const additionalContext = contextExtractor(req);
        context = { ...context, ...additionalContext };
      }

      // Verificar permissão
      const hasPermission = await rbacService.hasPermission(
        req.user.id, 
        resource, 
        action, 
        context
      );

      if (!hasPermission) {
        logger.warn('Permission denied', {
          userId: req.user.id,
          resource,
          action,
          context
        });

        return res.status(403).json({ 
          error: 'Acesso negado',
          details: `Sem permissão para ${action} em ${resource}`
        });
      }

      // Adicionar contexto à requisição para uso posterior
      req.permissionContext = context;
      
      next();
    } catch (error) {
      logger.error('Error in RBAC middleware:', error);
      res.status(500).json({ error: 'Erro interno de autorização' });
    }
  };
}

/**
 * Middleware para verificar múltiplas permissões (OR)
 */
function authorizeAny(permissions, contextExtractor = null) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const context = contextExtractor ? contextExtractor(req) : {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path
      };

      // Verificar se tem pelo menos uma das permissões
      for (const permission of permissions) {
        const [resource, action] = permission.split(':');
        const hasPermission = await rbacService.hasPermission(
          req.user.id, 
          resource, 
          action, 
          context
        );

        if (hasPermission) {
          req.permissionContext = context;
          return next();
        }
      }

      logger.warn('Permission denied (any)', {
        userId: req.user.id,
        permissions,
        context
      });

      res.status(403).json({ 
        error: 'Acesso negado',
        details: 'Sem permissão para nenhuma das operações solicitadas'
      });
    } catch (error) {
      logger.error('Error in RBAC any middleware:', error);
      res.status(500).json({ error: 'Erro interno de autorização' });
    }
  };
}

/**
 * Middleware para verificar múltiplas permissões (AND)
 */
function authorizeAll(permissions, contextExtractor = null) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const context = contextExtractor ? contextExtractor(req) : {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path
      };

      // Verificar se tem todas as permissões
      for (const permission of permissions) {
        const [resource, action] = permission.split(':');
        const hasPermission = await rbacService.hasPermission(
          req.user.id, 
          resource, 
          action, 
          context
        );

        if (!hasPermission) {
          logger.warn('Permission denied (all)', {
            userId: req.user.id,
            permission,
            context
          });

          return res.status(403).json({ 
            error: 'Acesso negado',
            details: `Sem permissão para ${action} em ${resource}`
          });
        }
      }

      req.permissionContext = context;
      next();
    } catch (error) {
      logger.error('Error in RBAC all middleware:', error);
      res.status(500).json({ error: 'Erro interno de autorização' });
    }
  };
}

/**
 * Middleware para verificar permissão baseada em parâmetros da rota
 */
function authorizeResourceOwner(resource, action, ownerExtractor) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return res.status(400).json({ error: 'ID do recurso não fornecido' });
      }

      // Extrair informações do proprietário do recurso
      const ownerInfo = await ownerExtractor(resourceId);
      
      const context = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        resourceId,
        resourceOwner: ownerInfo.ownerId,
        isOwner: req.user.id === ownerInfo.ownerId
      };

      // Verificar permissão
      const hasPermission = await rbacService.hasPermission(
        req.user.id, 
        resource, 
        action, 
        context
      );

      if (!hasPermission) {
        logger.warn('Resource owner permission denied', {
          userId: req.user.id,
          resourceId,
          resourceOwner: ownerInfo.ownerId,
          resource,
          action
        });

        return res.status(403).json({ 
          error: 'Acesso negado',
          details: 'Sem permissão para acessar este recurso'
        });
      }

      req.permissionContext = context;
      next();
    } catch (error) {
      logger.error('Error in resource owner middleware:', error);
      res.status(500).json({ error: 'Erro interno de autorização' });
    }
  };
}

/**
 * Middleware para verificar permissão baseada em dados da requisição
 */
function authorizeData(resource, action, dataExtractor) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      // Extrair dados da requisição
      const data = dataExtractor(req);
      
      const context = {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        path: req.path,
        ...data
      };

      // Verificar permissão
      const hasPermission = await rbacService.hasPermission(
        req.user.id, 
        resource, 
        action, 
        context
      );

      if (!hasPermission) {
        logger.warn('Data-based permission denied', {
          userId: req.user.id,
          resource,
          action,
          data
        });

        return res.status(403).json({ 
          error: 'Acesso negado',
          details: 'Sem permissão para esta operação com os dados fornecidos'
        });
      }

      req.permissionContext = context;
      next();
    } catch (error) {
      logger.error('Error in data-based middleware:', error);
      res.status(500).json({ error: 'Erro interno de autorização' });
    }
  };
}

/**
 * Middleware para logging de auditoria de permissões
 */
function auditPermissions(resource, action) {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (req.permissionContext) {
        logger.info('Permission audit', {
          userId: req.user?.id,
          resource,
          action,
          context: req.permissionContext,
          status: res.statusCode,
          timestamp: new Date().toISOString()
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
}

module.exports = {
  authorizeResource,
  authorizeAny,
  authorizeAll,
  authorizeResourceOwner,
  authorizeData,
  auditPermissions
};