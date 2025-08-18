// Repositório para persistência de sessões de bots no Supabase
const supabase = require('../supabaseClient.cjs');

const TABLE = 'bot_sessions';

async function insert(session) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert([session]);
  if (error) throw error;
  return data;
}

async function update(sessionId, updates) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(updates)
    .eq('session_id', sessionId);
  if (error) throw error;
  return data;
}

async function getById(sessionId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('session_id', sessionId)
    .single();
  if (error) throw error;
  return data;
}

async function getAll() {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*');
  if (error) throw error;
  return data;
}

async function deleteSession(sessionId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq('session_id', sessionId);
  if (error) throw error;
  return { success: true };
}

module.exports = { insert, update, getById, getAll, delete: deleteSession };
