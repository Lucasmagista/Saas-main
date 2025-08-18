// Repositório para acesso à tabela 'notifications' no Supabase
const supabase = require('../supabaseClient.cjs');

async function listAll() {
  const { data, error } = await supabase.from('notifications').select('*');
  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  listAll,
};
