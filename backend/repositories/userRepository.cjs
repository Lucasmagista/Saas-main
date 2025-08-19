// Repositório para acesso à tabela 'profiles' no PostgreSQL local
const db = require('../postgresClient.cjs');

async function listAll() {
  const result = await db.query('SELECT * FROM profiles ORDER BY created_at DESC');
  return result.rows;
}

async function update(id, updatedFields) {
  const keys = Object.keys(updatedFields);
  const values = Object.values(updatedFields);
  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const query = `UPDATE profiles SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
  const result = await db.query(query, [...values, id]);
  return result.rows[0];
}

async function remove(id) {
  await db.query('DELETE FROM profiles WHERE id = $1', [id]);
  return { success: true };
}

module.exports = {
  listAll,
  update,
  remove,
};
