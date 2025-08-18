const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger.cjs');

// Cliente Supabase para auditoria
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper de auditoria independente
const logAudit = async ({ req, action, resourceType, resourceId, oldValues, newValues }) => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: req?.user?.id || 'anon',
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues ? JSON.stringify(oldValues) : null,
      new_values: newValues ? JSON.stringify(newValues) : null,
      ip_address: req?.ip || 'unknown',
      user_agent: req?.headers?.['user-agent'] || 'unknown',
      date: new Date().toISOString(),
      route: req?.url || 'unknown'
    });
  } catch (e) {
    logger.error('[AUDIT ERROR]', { error: e });
  }
};

module.exports = {
  logAudit
};
