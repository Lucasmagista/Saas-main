/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Índices básicos para performance
  pgm.createIndex('bots', 'name');
  pgm.createIndex('bots', 'created_at');
  pgm.createIndex('bots', 'is_active');
  
  pgm.createIndex('bot_logs', 'bot_id');
  pgm.createIndex('bot_logs', 'created_at');
  pgm.createIndex('bot_logs', ['bot_id', 'created_at']);
  
  pgm.createIndex('webhooks', 'url');
  pgm.createIndex('webhooks', 'is_active');
  pgm.createIndex('webhooks', 'created_at');
  
  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'created_at');
  pgm.createIndex('users', 'is_active');
  
  pgm.createIndex('audit_logs_v2', 'user_id');
  pgm.createIndex('audit_logs_v2', 'action');
  pgm.createIndex('audit_logs_v2', 'resource_type');
  pgm.createIndex('audit_logs_v2', 'created_at');
  pgm.createIndex('audit_logs_v2', ['user_id', 'created_at']);
  pgm.createIndex('audit_logs_v2', ['resource_type', 'resource_id']);
  
  // Índices parciais para dados ativos
  pgm.createIndex('bots', 'name', { where: 'is_active = true' });
  pgm.createIndex('webhooks', 'url', { where: 'is_active = true' });
  pgm.createIndex('users', 'email', { where: 'is_active = true' });
  
  // Índices para foreign keys
  pgm.createIndex('bot_logs', 'bot_id', { where: 'bot_id IS NOT NULL' });
  pgm.createIndex('audit_logs_v2', 'user_id', { where: 'user_id IS NOT NULL' });
};

exports.down = pgm => {
  pgm.dropIndex('bots', 'name');
  pgm.dropIndex('bots', 'created_at');
  pgm.dropIndex('bots', 'is_active');
  
  pgm.dropIndex('bot_logs', 'bot_id');
  pgm.dropIndex('bot_logs', 'created_at');
  pgm.dropIndex('bot_logs', ['bot_id', 'created_at']);
  
  pgm.dropIndex('webhooks', 'url');
  pgm.dropIndex('webhooks', 'is_active');
  pgm.dropIndex('webhooks', 'created_at');
  
  pgm.dropIndex('users', 'email');
  pgm.dropIndex('users', 'created_at');
  pgm.dropIndex('users', 'is_active');
  
  pgm.dropIndex('audit_logs_v2', 'user_id');
  pgm.dropIndex('audit_logs_v2', 'action');
  pgm.dropIndex('audit_logs_v2', 'resource_type');
  pgm.dropIndex('audit_logs_v2', 'created_at');
  pgm.dropIndex('audit_logs_v2', ['user_id', 'created_at']);
  pgm.dropIndex('audit_logs_v2', ['resource_type', 'resource_id']);
  
  pgm.dropIndex('bots', 'name', { where: 'is_active = true' });
  pgm.dropIndex('webhooks', 'url', { where: 'is_active = true' });
  pgm.dropIndex('users', 'email', { where: 'is_active = true' });
  
  pgm.dropIndex('bot_logs', 'bot_id', { where: 'bot_id IS NOT NULL' });
  pgm.dropIndex('audit_logs_v2', 'user_id', { where: 'user_id IS NOT NULL' });
};