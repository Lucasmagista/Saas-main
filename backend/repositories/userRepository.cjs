// Repositório para acesso à tabela 'profiles' no Supabase
const supabase = require('../supabaseClient.cjs');

async function listAll() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) throw new Error(error.message);
  return data || [];
}

async function update(id, updatedFields) {
  const { data, error } = await supabase.from('profiles').update(updatedFields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function remove(id) {
  const { error } = await supabase.from('profiles').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

module.exports = {
  listAll,
  update,
  remove,
};
