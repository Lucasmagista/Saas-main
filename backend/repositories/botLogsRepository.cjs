// Repositório para acesso à tabela 'bot_logs' no Supabase
const supabase = require('../supabaseClient.cjs');

async function insert(log) {
  const { error } = await supabase.from('bot_logs').insert(log);
  if (error) throw new Error(error.message);
  return { success: true };
}

async function listByBotId(botId, limit = 50) {
  const { data, error } = await supabase.from('bot_logs').select('*').eq('bot_id', botId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  insert,
  listByBotId,
};
