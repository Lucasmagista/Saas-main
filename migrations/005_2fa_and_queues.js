/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Adicionar campos de 2FA na tabela users
  pgm.addColumns('users', {
    two_factor_secret: { type: 'varchar(255)' },
    two_factor_enabled: { type: 'boolean', notNull: true, default: false },
    backup_codes: { type: 'jsonb' }
  });

  // Criar tabela de mensagens
  pgm.createTable('messages', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    bot_id: { type: 'uuid', notNull: true, references: 'bots(id)', onDelete: 'CASCADE' },
    to_number: { type: 'varchar(20)' },
    content: { type: 'text', notNull: true },
    type: { type: 'varchar(20)', notNull: true, default: 'text' },
    metadata: { type: 'jsonb' },
    status: { type: 'varchar(20)', notNull: true, default: 'pending' },
    sent_at: { type: 'timestamp' },
    delivered_at: { type: 'timestamp' },
    error_message: { type: 'text' },
    retry_count: { type: 'integer', notNull: true, default: 0 },
    created_by: { type: 'uuid', references: 'users(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Criar tabela de entregas de webhooks
  pgm.createTable('webhook_deliveries', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    webhook_id: { type: 'uuid', notNull: true, references: 'webhooks(id)', onDelete: 'CASCADE' },
    event: { type: 'varchar(100)', notNull: true },
    payload: { type: 'jsonb', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: 'pending' },
    response_code: { type: 'integer' },
    response_body: { type: 'text' },
    response_headers: { type: 'jsonb' },
    retry_count: { type: 'integer', notNull: true, default: 0 },
    next_retry_at: { type: 'timestamp' },
    sent_at: { type: 'timestamp' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Criar tabela de jobs das filas
  pgm.createTable('queue_jobs', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    queue_name: { type: 'varchar(100)', notNull: true },
    job_type: { type: 'varchar(100)', notNull: true },
    job_id: { type: 'varchar(255)', notNull: true, unique: true },
    data: { type: 'jsonb', notNull: true },
    status: { type: 'varchar(20)', notNull: true, default: 'pending' },
    priority: { type: 'integer', notNull: true, default: 0 },
    attempts: { type: 'integer', notNull: true, default: 0 },
    max_attempts: { type: 'integer', notNull: true, default: 3 },
    delay: { type: 'integer', notNull: true, default: 0 },
    processed_at: { type: 'timestamp' },
    failed_at: { type: 'timestamp' },
    error_message: { type: 'text' },
    result: { type: 'jsonb' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });

  // Índices para performance
  pgm.createIndex('messages', 'bot_id');
  pgm.createIndex('messages', 'status');
  pgm.createIndex('messages', 'created_at');
  pgm.createIndex('messages', 'to_number');
  pgm.createIndex('messages', ['bot_id', 'status']);
  pgm.createIndex('messages', ['status', 'created_at']);

  pgm.createIndex('webhook_deliveries', 'webhook_id');
  pgm.createIndex('webhook_deliveries', 'status');
  pgm.createIndex('webhook_deliveries', 'created_at');
  pgm.createIndex('webhook_deliveries', 'event');
  pgm.createIndex('webhook_deliveries', ['webhook_id', 'status']);
  pgm.createIndex('webhook_deliveries', ['status', 'next_retry_at']);

  pgm.createIndex('queue_jobs', 'queue_name');
  pgm.createIndex('queue_jobs', 'job_type');
  pgm.createIndex('queue_jobs', 'status');
  pgm.createIndex('queue_jobs', 'priority');
  pgm.createIndex('queue_jobs', 'created_at');
  pgm.createIndex('queue_jobs', ['queue_name', 'status']);
  pgm.createIndex('queue_jobs', ['status', 'priority', 'created_at']);

  // Índices parciais para dados ativos
  pgm.createIndex('messages', 'status', { where: "status IN ('pending', 'sent')" });
  pgm.createIndex('webhook_deliveries', 'status', { where: "status IN ('pending', 'failed')" });
  pgm.createIndex('queue_jobs', 'status', { where: "status IN ('pending', 'active')" });

  // Índices para 2FA
  pgm.createIndex('users', 'two_factor_enabled', { where: 'two_factor_enabled = true' });

  // Trigger para atualizar updated_at
  pgm.sql(`
    CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_webhook_deliveries_updated_at 
    BEFORE UPDATE ON webhook_deliveries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_queue_jobs_updated_at 
    BEFORE UPDATE ON queue_jobs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = pgm => {
  // Remover triggers
  pgm.dropTrigger('messages', 'update_messages_updated_at');
  pgm.dropTrigger('webhook_deliveries', 'update_webhook_deliveries_updated_at');
  pgm.dropTrigger('queue_jobs', 'update_queue_jobs_updated_at');

  // Remover tabelas
  pgm.dropTable('queue_jobs');
  pgm.dropTable('webhook_deliveries');
  pgm.dropTable('messages');

  // Remover colunas de 2FA
  pgm.dropColumns('users', ['two_factor_secret', 'two_factor_enabled', 'backup_codes']);
};