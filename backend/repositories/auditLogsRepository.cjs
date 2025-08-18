// Repositório para acesso à tabela 'audit_logs' no Supabase
const supabase = require('../supabaseClient.cjs');

async function listAll(filters = {}) {
  let query = supabase.from('audit_logs').select('*');
  if (filters.user_id) query = query.eq('user_id', filters.user_id);
  if (filters.action) query = query.eq('action', filters.action);
  if (filters.date_from) query = query.gte('date', filters.date_from);
  if (filters.date_to) query = query.lte('date', filters.date_to);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  listAll,
};
