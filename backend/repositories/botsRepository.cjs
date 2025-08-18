// Repositório para acesso à tabela 'bots' no Supabase
const supabase = require('../supabaseClient.cjs');


async function listAll() {
  const { data, error } = await supabase.from('bots').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

async function insert(payload) {
  const { data, error } = await supabase.from('bots').insert([payload]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function update(id, updatedFields) {
  const { data, error } = await supabase.from('bots').update(updatedFields).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

async function findById(id) {
  const { data, error } = await supabase.from('bots').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

async function findQrcodeById(id) {
  const { data, error } = await supabase.from('bots').select('qrcode').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

async function remove(id) {
  const { error } = await supabase.from('bots').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return { success: true };
}

module.exports = {
  listAll,
  insert,
  update,
  findById,
  findQrcodeById,
  remove,
  // Alias para compatibilidade
  delete: remove,
  getById: findById,
};
