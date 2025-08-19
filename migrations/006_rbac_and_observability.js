/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Tabela de roles customizados
  pgm.createTable('roles', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(100)', notNull: true, unique: true },
    description: { type: 'text' },
    permissions: { type: 'jsonb', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Tabela de permissões customizadas por usuário
  pgm.createTable('user_permissions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    permissions: { type: 'jsonb', notNull: true },
    conditions: { type: 'jsonb' }, // Condições ABAC
    created_by: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Tabela de Dead Letter Queue para webhooks
  pgm.createTable('webhook_dlq', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    webhook_id: { type: 'uuid', notNull: true, references: 'webhooks(id)', onDelete: 'CASCADE' },
    event: { type: 'varchar(100)', notNull: true },
    payload: { type: 'jsonb', notNull: true },
    signature: { type: 'text' },
    error_message: { type: 'text' },
    retry_count: { type: 'integer', notNull: true, default: 0 },
    reprocessed: { type: 'boolean', notNull: true, default: false },
    failed_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    reprocessed_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Tabela de logs estruturados
  pgm.createTable('structured_logs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    level: { type: 'varchar(20)', notNull: true },
    message: { type: 'text', notNull: true },
    context: { type: 'jsonb' },
    correlation_id: { type: 'varchar(100)' },
    request_id: { type: 'varchar(100)' },
    user_id: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    ip_address: { type: 'inet' },
    user_agent: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Tabela de métricas
  pgm.createTable('metrics', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(100)', notNull: true },
    value: { type: 'numeric', notNull: true },
    labels: { type: 'jsonb' },
    timestamp: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Tabela de traces
  pgm.createTable('traces', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    trace_id: { type: 'varchar(100)', notNull: true },
    span_id: { type: 'varchar(100)', notNull: true },
    operation: { type: 'varchar(200)', notNull: true },
    context: { type: 'jsonb' },
    start_time: { type: 'timestamp', notNull: true },
    end_time: { type: 'timestamp' },
    duration: { type: 'integer' }, // em ms
    result: { type: 'jsonb' },
    error: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Índices para performance
  pgm.createIndex('roles', 'name');
  pgm.createIndex('roles', 'is_active');

  pgm.createIndex('user_permissions', 'user_id');
  pgm.createIndex('user_permissions', 'created_by');

  pgm.createIndex('webhook_dlq', 'webhook_id');
  pgm.createIndex('webhook_dlq', 'event');
  pgm.createIndex('webhook_dlq', 'failed_at');
  pgm.createIndex('webhook_dlq', 'reprocessed');
  pgm.createIndex('webhook_dlq', ['webhook_id', 'reprocessed']);

  pgm.createIndex('structured_logs', 'level');
  pgm.createIndex('structured_logs', 'correlation_id');
  pgm.createIndex('structured_logs', 'request_id');
  pgm.createIndex('structured_logs', 'user_id');
  pgm.createIndex('structured_logs', 'created_at');
  pgm.createIndex('structured_logs', ['level', 'created_at']);

  pgm.createIndex('metrics', 'name');
  pgm.createIndex('metrics', 'timestamp');
  pgm.createIndex('metrics', ['name', 'timestamp']);

  pgm.createIndex('traces', 'trace_id');
  pgm.createIndex('traces', 'span_id');
  pgm.createIndex('traces', 'operation');
  pgm.createIndex('traces', 'start_time');
  pgm.createIndex('traces', ['trace_id', 'start_time']);

  // Índices parciais
  pgm.createIndex('webhook_dlq', 'failed_at', { where: 'reprocessed = false' });
  pgm.createIndex('structured_logs', 'level', { where: "level IN ('error', 'warn')" });
  pgm.createIndex('metrics', 'name', { where: 'value > 0' });

  // Triggers para updated_at
  pgm.sql(`
    CREATE TRIGGER update_roles_updated_at 
    BEFORE UPDATE ON roles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_user_permissions_updated_at 
    BEFORE UPDATE ON user_permissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);

  // Inserir roles padrão
  pgm.sql(`
    INSERT INTO roles (name, description, permissions) VALUES
    ('admin', 'Administrador completo do sistema', '["*"]'),
    ('manager', 'Gerente com acesso amplo', '["bots:*", "messages:*", "webhooks:*", "users:read", "reports:*", "integrations:*", "analytics:*", "settings:read"]'),
    ('user', 'Usuário padrão', '["bots:read", "bots:create", "bots:update", "messages:read", "messages:create", "messages:send", "webhooks:read", "webhooks:create", "webhooks:update", "reports:read", "analytics:read"]'),
    ('viewer', 'Apenas visualização', '["bots:read", "messages:read", "webhooks:read", "reports:read", "analytics:read"]')
    ON CONFLICT (name) DO NOTHING;
  `);
};

exports.down = pgm => {
  // Remover triggers
  pgm.dropTrigger('roles', 'update_roles_updated_at');
  pgm.dropTrigger('user_permissions', 'update_user_permissions_updated_at');

  // Remover tabelas
  pgm.dropTable('traces');
  pgm.dropTable('metrics');
  pgm.dropTable('structured_logs');
  pgm.dropTable('webhook_dlq');
  pgm.dropTable('user_permissions');
  pgm.dropTable('roles');
};