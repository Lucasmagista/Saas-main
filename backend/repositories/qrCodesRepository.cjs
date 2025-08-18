// Repositório para acesso à tabela 'qr_codes' no Supabase
const supabase = require('../supabaseClient.cjs');

async function insert(qr) {
  const { error } = await supabase.from('qr_codes').insert(qr);
  if (error) throw new Error(error.message);
}

async function listByBot(bot_id, limit = 10) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('bot_id', bot_id)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { insert, listByBot };
