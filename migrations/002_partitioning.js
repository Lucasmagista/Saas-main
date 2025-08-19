/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  // Particionamento de bot_logs por mês
  pgm.sql(`
    CREATE TABLE bot_logs_partitioned (
      LIKE bot_logs INCLUDING ALL
    ) PARTITION BY RANGE (created_at);
  `);
  
  // Criar partições para os próximos 12 meses
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
    const partitionName = `bot_logs_${startDate.getFullYear()}_${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    
    pgm.sql(`
      CREATE TABLE ${partitionName} PARTITION OF bot_logs_partitioned
      FOR VALUES FROM ('${startDate.toISOString()}') TO ('${endDate.toISOString()}');
    `);
  }
  
  // Particionamento de audit_logs_v2 por mês
  pgm.sql(`
    CREATE TABLE audit_logs_v2_partitioned (
      LIKE audit_logs_v2 INCLUDING ALL
    ) PARTITION BY RANGE (created_at);
  `);
  
  // Criar partições para audit_logs_v2
  for (let i = 0; i < 12; i++) {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 1);
    const partitionName = `audit_logs_v2_${startDate.getFullYear()}_${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    
    pgm.sql(`
      CREATE TABLE ${partitionName} PARTITION OF audit_logs_v2_partitioned
      FOR VALUES FROM ('${startDate.toISOString()}') TO ('${endDate.toISOString()}');
    `);
  }
  
  // Índices nas partições
  pgm.sql(`
    CREATE INDEX CONCURRENTLY idx_bot_logs_partitioned_bot_id_created 
    ON bot_logs_partitioned (bot_id, created_at);
    
    CREATE INDEX CONCURRENTLY idx_audit_logs_v2_partitioned_user_created 
    ON audit_logs_v2_partitioned (user_id, created_at);
  `);
};

exports.down = pgm => {
  // Remover partições
  const currentDate = new Date();
  for (let i = 0; i < 12; i++) {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
    const botPartitionName = `bot_logs_${startDate.getFullYear()}_${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    const auditPartitionName = `audit_logs_v2_${startDate.getFullYear()}_${String(startDate.getMonth() + 1).padStart(2, '0')}`;
    
    pgm.dropTable(botPartitionName, { cascade: true });
    pgm.dropTable(auditPartitionName, { cascade: true });
  }
  
  pgm.dropTable('bot_logs_partitioned', { cascade: true });
  pgm.dropTable('audit_logs_v2_partitioned', { cascade: true });
};