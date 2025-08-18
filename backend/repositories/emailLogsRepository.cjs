// Repositório para acesso à tabela 'email_logs' no Supabase
const supabase = require('../supabaseClient.cjs');

async function listAll(limit = 100) {
  const { data, error } = await supabase.from('email_logs').select('*').order('timestamp', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  listAll,
};
