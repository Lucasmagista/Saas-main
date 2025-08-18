// Repositório para acesso à tabela 'email_providers' no Supabase
const supabase = require('../supabaseClient.cjs');

async function listAll() {
  const { data, error } = await supabase.from('email_providers').select('*');
  if (error) throw new Error(error.message);
  return data || [];
}

module.exports = {
  listAll,
};
