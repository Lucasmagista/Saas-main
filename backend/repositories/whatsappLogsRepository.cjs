// Repositório para acesso à tabela 'whatsapp_logs' no Supabase
const supabase = require('../supabaseClient.cjs');

async function insert(log) {
  const { error } = await supabase.from('whatsapp_logs').insert(log);
  if (error) throw new Error(error.message);
}

async function listByNumber(number, limit = 50) {
  const { data, error } = await supabase
    .from('whatsapp_logs')
    .select('*')
    .eq('number', number)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { insert, listByNumber };
