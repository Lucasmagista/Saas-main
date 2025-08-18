// Repositório para acesso à tabela 'integrations' no Supabase
const supabase = require('../supabaseClient.cjs');

async function listAll() {
  const { data, error } = await supabase.from('integrations').select('*');
  if (error) throw new Error(error.message);
  return data || [];
}

async function insert(payload) {
  const { data, error } = await supabase.from('integrations').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function update(id, updatedFields) {
  const { data, error } = await supabase.from('integrations').update(updatedFields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function remove(id) {
  const { error } = await supabase.from('integrations').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

module.exports = {
  listAll,
  insert,
  update,
  remove,
};
