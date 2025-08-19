/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Tabela para refresh tokens
  pgm.createTable('refresh_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    token_hash: { type: 'varchar(255)', notNull: true },
    family_id: { type: 'uuid', notNull: true }, // Para rotação de tokens
    expires_at: { type: 'timestamp', notNull: true },
    is_revoked: { type: 'boolean', notNull: true, default: false },
    ip_address: { type: 'inet' },
    user_agent: { type: 'text' },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });
  
  // Índices para performance
  pgm.createIndex('refresh_tokens', 'user_id');
  pgm.createIndex('refresh_tokens', 'token_hash');
  pgm.createIndex('refresh_tokens', 'family_id');
  pgm.createIndex('refresh_tokens', 'expires_at');
  pgm.createIndex('refresh_tokens', 'is_revoked');
  pgm.createIndex('refresh_tokens', ['user_id', 'is_revoked']);
  
  // Índices parciais
  pgm.createIndex('refresh_tokens', 'token_hash', { where: 'is_revoked = false' });
  pgm.createIndex('refresh_tokens', 'expires_at', { where: 'is_revoked = false' });
  
  // Tabela para sessões de usuário
  pgm.createTable('user_sessions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    session_token: { type: 'varchar(255)', notNull: true },
    ip_address: { type: 'inet' },
    user_agent: { type: 'text' },
    last_activity: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    expires_at: { type: 'timestamp', notNull: true },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });
  
  // Índices para sessões
  pgm.createIndex('user_sessions', 'user_id');
  pgm.createIndex('user_sessions', 'session_token');
  pgm.createIndex('user_sessions', 'last_activity');
  pgm.createIndex('user_sessions', 'expires_at');
  pgm.createIndex('user_sessions', 'is_active');
  pgm.createIndex('user_sessions', ['user_id', 'is_active']);
  
  // Índices parciais para sessões ativas
  pgm.createIndex('user_sessions', 'session_token', { where: 'is_active = true' });
  pgm.createIndex('user_sessions', 'last_activity', { where: 'is_active = true' });
  
  // Procedure para limpeza de tokens expirados
  pgm.sql(`
    CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
    RETURNS void AS $$
    BEGIN
      DELETE FROM refresh_tokens WHERE expires_at < NOW();
      DELETE FROM user_sessions WHERE expires_at < NOW();
      RAISE NOTICE 'Expired tokens cleanup completed at %', NOW();
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  // Procedure para revogar todos os tokens de um usuário
  pgm.sql(`
    CREATE OR REPLACE FUNCTION revoke_user_tokens(user_id_to_revoke uuid)
    RETURNS void AS $$
    BEGIN
      UPDATE refresh_tokens 
      SET is_revoked = true, updated_at = NOW() 
      WHERE user_id = user_id_to_revoke AND is_revoked = false;
      
      UPDATE user_sessions 
      SET is_active = false, updated_at = NOW() 
      WHERE user_id = user_id_to_revoke AND is_active = true;
      
      RAISE NOTICE 'All tokens revoked for user %', user_id_to_revoke;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  // Trigger para atualizar updated_at
  pgm.sql(`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS trigger AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  // Aplicar trigger nas tabelas
  pgm.sql(`
    CREATE TRIGGER update_refresh_tokens_updated_at 
    BEFORE UPDATE ON refresh_tokens 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_user_sessions_updated_at 
    BEFORE UPDATE ON user_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  `);
};

exports.down = pgm => {
  pgm.dropTrigger('refresh_tokens', 'update_refresh_tokens_updated_at');
  pgm.dropTrigger('user_sessions', 'update_user_sessions_updated_at');
  pgm.dropFunction('update_updated_at_column');
  pgm.dropFunction('cleanup_expired_tokens');
  pgm.dropFunction('revoke_user_tokens', ['uuid']);
  
  pgm.dropTable('user_sessions');
  pgm.dropTable('refresh_tokens');
};