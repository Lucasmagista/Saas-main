// Repositório para acesso à tabela 'settings' no Supabase
const supabase = require('../supabaseClient.cjs');

async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*').single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateSettings(id, updatedFields) {
  const { data, error } = await supabase.from('settings').update(updatedFields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

module.exports = {
  getSettings,
  updateSettings,
};
