const db = require('../postgresClient.cjs');
const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');

class RBACService {
  constructor() {
    this.permissions = {
      // Recursos do sistema
      resources: {
        bots: ['create', 'read', 'update', 'delete', 'start', 'stop', 'import'],
        messages: ['create', 'read', 'update', 'delete', 'send', 'batch'],
        webhooks: ['create', 'read', 'update', 'delete', 'test', 'regenerate'],
        users: ['create', 'read', 'update', 'delete', 'manage'],
        reports: ['create', 'read', 'update', 'delete', 'export'],
        integrations: ['create', 'read', 'update', 'delete', 'configure'],
        analytics: ['read', 'export'],
        settings: ['read', 'update'],
        audit: ['read'],
        security: ['read', 'update']
      },
      
      // Roles padrão
      roles: {
        admin: {
          description: 'Administrador completo do sistema',
          permissions: ['*'] // Todas as permissões
        },
        manager: {
          description: 'Gerente com acesso amplo',
          permissions: [
            'bots:*',
            'messages:*',
            'webhooks:*',
            'users:read',
            'reports:*',
            'integrations:*',
            'analytics:*',
            'settings:read'
          ]
        },
        user: {
          description: 'Usuário padrão',
          permissions: [
            'bots:read',
            'bots:create',
            'bots:update',
            'messages:read',
            'messages:create',
            'messages:send',
            'webhooks:read',
            'webhooks:create',
            'webhooks:update',
            'reports:read',
            'analytics:read'
          ]
        },
        viewer: {
          description: 'Apenas visualização',
          permissions: [
            'bots:read',
            'messages:read',
            'webhooks:read',
            'reports:read',
            'analytics:read'
          ]
        }
      }
    };
  }

  /**
   * Verifica se usuário tem permissão específica
   */
  async hasPermission(userId, resource, action, context = {}) {
    try {
      // Buscar usuário e suas permissões
      const userResult = await db.query(`
        SELECT u.id, u.role, up.permissions, up.conditions
        FROM users u
        LEFT JOIN user_permissions up ON u.id = up.user_id
        WHERE u.id = $1 AND u.is_active = true
      `, [userId]);

      if (userResult.rows.length === 0) {
        return false;
      }

      const user = userResult.rows[0];
      
      // Verificar permissões do role padrão
      const rolePermissions = this.permissions.roles[user.role]?.permissions || [];
      
      // Verificar permissões customizadas do usuário
      const customPermissions = user.permissions ? JSON.parse(user.permissions) : [];
      
      // Combinar permissões
      const allPermissions = [...rolePermissions, ...customPermissions];
      
      // Verificar permissão wildcard
      if (allPermissions.includes('*')) {
        return this.evaluateConditions(user.conditions, context);
      }
      
      // Verificar permissão específica
      const permission = `${resource}:${action}`;
      const hasPermission = allPermissions.includes(permission);
      
      if (!hasPermission) {
        return false;
      }
      
      // Avaliar condições ABAC
      return this.evaluateConditions(user.conditions, context);
    } catch (error) {
      logger.error('Error checking permission:', { error: error.message, userId, resource, action });
      return false;
    }
  }

  /**
   * Avalia condições ABAC
   */
  evaluateConditions(conditions, context) {
    if (!conditions) return true;
    
    try {
      const parsedConditions = JSON.parse(conditions);
      
      for (const condition of parsedConditions) {
        const { field, operator, value } = condition;
        
        switch (operator) {
          case 'equals':
            if (context[field] !== value) return false;
            break;
          case 'not_equals':
            if (context[field] === value) return false;
            break;
          case 'in':
            if (!Array.isArray(value) || !value.includes(context[field])) return false;
            break;
          case 'not_in':
            if (Array.isArray(value) && value.includes(context[field])) return false;
            break;
          case 'greater_than':
            if (context[field] <= value) return false;
            break;
          case 'less_than':
            if (context[field] >= value) return false;
            break;
          case 'contains':
            if (!context[field]?.includes(value)) return false;
            break;
          case 'regex':
            if (!new RegExp(value).test(context[field])) return false;
            break;
          case 'time_between':
            const now = new Date();
            const start = new Date(value.start);
            const end = new Date(value.end);
            if (now < start || now > end) return false;
            break;
          case 'ip_in_range':
            if (!this.isIPInRange(context.ip, value)) return false;
            break;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error evaluating conditions:', error);
      return false;
    }
  }

  /**
   * Verifica se IP está em range
   */
  isIPInRange(ip, range) {
    // Implementação básica - pode ser expandida
    return range.includes(ip);
  }

  /**
   * Atribui permissões a um usuário
   */
  async assignPermissions(userId, permissions, conditions = null) {
    try {
      await db.query(`
        INSERT INTO user_permissions (user_id, permissions, conditions, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          permissions = $2,
          conditions = $3,
          updated_at = NOW()
      `, [userId, JSON.stringify(permissions), JSON.stringify(conditions), userId]);

      await logAudit({ 
        action: 'assign_permissions', 
        resourceType: 'user', 
        resourceId: userId,
        newValues: { permissions, conditions }
      });

      logger.info('Permissions assigned to user:', { userId, permissions });
      return true;
    } catch (error) {
      logger.error('Error assigning permissions:', error);
      throw error;
    }
  }

  /**
   * Remove permissões de um usuário
   */
  async removePermissions(userId) {
    try {
      await db.query('DELETE FROM user_permissions WHERE user_id = $1', [userId]);

      await logAudit({ 
        action: 'remove_permissions', 
        resourceType: 'user', 
        resourceId: userId
      });

      logger.info('Permissions removed from user:', { userId });
      return true;
    } catch (error) {
      logger.error('Error removing permissions:', error);
      throw error;
    }
  }

  /**
   * Lista permissões de um usuário
   */
  async getUserPermissions(userId) {
    try {
      const result = await db.query(`
        SELECT up.permissions, up.conditions, u.role
        FROM users u
        LEFT JOIN user_permissions up ON u.id = up.user_id
        WHERE u.id = $1
      `, [userId]);

      if (result.rows.length === 0) {
        return null;
      }

      const user = result.rows[0];
      const rolePermissions = this.permissions.roles[user.role]?.permissions || [];
      const customPermissions = user.permissions ? JSON.parse(user.permissions) : [];

      return {
        role: user.role,
        rolePermissions,
        customPermissions,
        conditions: user.conditions ? JSON.parse(user.conditions) : null,
        allPermissions: [...rolePermissions, ...customPermissions]
      };
    } catch (error) {
      logger.error('Error getting user permissions:', error);
      throw error;
    }
  }

  /**
   * Cria role customizado
   */
  async createRole(name, description, permissions) {
    try {
      await db.query(`
        INSERT INTO roles (name, description, permissions)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) 
        DO UPDATE SET 
          description = $2,
          permissions = $3,
          updated_at = NOW()
      `, [name, description, JSON.stringify(permissions)]);

      logger.info('Role created:', { name, permissions });
      return true;
    } catch (error) {
      logger.error('Error creating role:', error);
      throw error;
    }
  }

  /**
   * Lista todos os roles
   */
  async getRoles() {
    try {
      const result = await db.query('SELECT * FROM roles ORDER BY name');
      return result.rows;
    } catch (error) {
      logger.error('Error getting roles:', error);
      throw error;
    }
  }

  /**
   * Verifica permissões em lote
   */
  async checkMultiplePermissions(userId, permissions) {
    const results = {};
    
    for (const permission of permissions) {
      const [resource, action] = permission.split(':');
      results[permission] = await this.hasPermission(userId, resource, action);
    }
    
    return results;
  }

  /**
   * Gera matriz de permissões
   */
  async generatePermissionMatrix() {
    try {
      const users = await db.query(`
        SELECT u.id, u.email, u.role, up.permissions
        FROM users u
        LEFT JOIN user_permissions up ON u.id = up.user_id
        WHERE u.is_active = true
      `);

      const matrix = {};
      
      for (const user of users.rows) {
        const permissions = await this.getUserPermissions(user.id);
        matrix[user.email] = {
          role: user.role,
          permissions: permissions.allPermissions,
          customPermissions: permissions.customPermissions
        };
      }
      
      return matrix;
    } catch (error) {
      logger.error('Error generating permission matrix:', error);
      throw error;
    }
  }
}

module.exports = new RBACService();