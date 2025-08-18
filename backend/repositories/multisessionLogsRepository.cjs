// Repositório para acesso à tabela 'multisession_logs' no Supabase
const supabase = require('../supabaseClient.cjs');

async function insert(log) {
  const { error } = await supabase.from('multisession_logs').insert(log);
  if (error) throw new Error(error.message);
  return { success: true };
}

module.exports = {
  insert,
};
