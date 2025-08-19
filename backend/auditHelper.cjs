const logger = require('./logger.cjs');
const db = require('./postgresClient.cjs');

// Helper de auditoria independente
const logAudit = async ({ req, action, resourceType, resourceId, oldValues, newValues }) => {
  try {
    await db.query(
      `INSERT INTO audit_logs_v2(
        user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, date, route
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        req?.user?.id || 'anon',
        action,
        resourceType,
        resourceId,
        oldValues ? JSON.stringify(oldValues) : null,
        newValues ? JSON.stringify(newValues) : null,
        req?.ip || 'unknown',
        req?.headers?.['user-agent'] || 'unknown',
        new Date().toISOString(),
        req?.url || 'unknown',
      ]
    );
  } catch (e) {
    logger.error('[AUDIT ERROR]', { error: e });
  }
};

module.exports = {
  logAudit
};
