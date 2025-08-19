/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Procedure para limpeza automática de logs antigos
  pgm.sql(`
    CREATE OR REPLACE FUNCTION cleanup_old_logs()
    RETURNS void AS $$
    DECLARE
      cutoff_date timestamp;
    BEGIN
      -- Logs de bot com mais de 90 dias
      cutoff_date := NOW() - INTERVAL '90 days';
      DELETE FROM bot_logs WHERE created_at < cutoff_date;
      
      -- Logs de auditoria com mais de 1 ano
      cutoff_date := NOW() - INTERVAL '1 year';
      DELETE FROM audit_logs_v2 WHERE created_at < cutoff_date;
      
      -- Logs de webhook com mais de 30 dias
      cutoff_date := NOW() - INTERVAL '30 days';
      DELETE FROM webhook_logs WHERE created_at < cutoff_date;
      
      RAISE NOTICE 'Cleanup completed at %', NOW();
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  // Procedure para anonimização de dados pessoais
  pgm.sql(`
    CREATE OR REPLACE FUNCTION anonymize_user_data(user_id_to_anonymize uuid)
    RETURNS void AS $$
    BEGIN
      -- Anonimizar dados do usuário
      UPDATE users 
      SET 
        email = 'anonymized_' || user_id_to_anonymize || '@deleted.com',
        name = 'Anonymized User',
        phone = NULL,
        avatar_url = NULL,
        updated_at = NOW()
      WHERE id = user_id_to_anonymize;
      
      -- Anonimizar logs de auditoria
      UPDATE audit_logs_v2 
      SET 
        user_id = NULL,
        user_email = 'anonymized@deleted.com',
        updated_at = NOW()
      WHERE user_id = user_id_to_anonymize;
      
      RAISE NOTICE 'User % anonymized', user_id_to_anonymize;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  // Trigger para limpeza automática mensal
  pgm.sql(`
    CREATE OR REPLACE FUNCTION schedule_cleanup()
    RETURNS trigger AS $$
    BEGIN
      -- Executar cleanup se for o primeiro dia do mês
      IF EXTRACT(DAY FROM NOW()) = 1 THEN
        PERFORM cleanup_old_logs();
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  
  // Criar tabela de configuração de retenção
  pgm.createTable('data_retention_config', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    table_name: { type: 'varchar(100)', notNull: true },
    retention_days: { type: 'integer', notNull: true },
    anonymize_after_days: { type: 'integer' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('NOW()') }
  });
  
  // Inserir configurações padrão
  pgm.sql(`
    INSERT INTO data_retention_config (table_name, retention_days, anonymize_after_days) VALUES
    ('bot_logs', 90, NULL),
    ('audit_logs_v2', 365, 730),
    ('webhook_logs', 30, NULL),
    ('messages', 180, 365),
    ('user_sessions', 30, NULL);
  `);
  
  // Índices para performance das procedures
  pgm.createIndex('bot_logs', 'created_at', { where: 'created_at < NOW() - INTERVAL \'90 days\'' });
  pgm.createIndex('audit_logs_v2', 'created_at', { where: 'created_at < NOW() - INTERVAL \'1 year\'' });
};

exports.down = pgm => {
  pgm.dropFunction('cleanup_old_logs');
  pgm.dropFunction('anonymize_user_data', ['uuid']);
  pgm.dropFunction('schedule_cleanup');
  pgm.dropTable('data_retention_config');
  
  pgm.dropIndex('bot_logs', 'created_at', { where: 'created_at < NOW() - INTERVAL \'90 days\'' });
  pgm.dropIndex('audit_logs_v2', 'created_at', { where: 'created_at < NOW() - INTERVAL \'1 year\'' });
};