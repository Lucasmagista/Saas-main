// Repositório para acesso à tabela 'multisessions' no Supabase
const supabase = require('../supabaseClient.cjs');

async function listAll() {
  const { data, error } = await supabase.from('multisessions').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

async function insert(payload) {
  const { data, error } = await supabase.from('multisessions').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function update(id, updatedFields) {
  const { data, error } = await supabase.from('multisessions').update(updatedFields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('multisessions').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

async function remove(id) {
  const { error } = await supabase.from('multisessions').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

module.exports = {
  listAll,
  insert,
  update,
  findById,
  remove,
};
