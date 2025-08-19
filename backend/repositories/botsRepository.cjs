
// Repositório para acesso à tabela 'bots' no PostgreSQL local
const db = require('../postgresClient.cjs');



async function listAll() {
  const result = await db.query('SELECT * FROM bots ORDER BY created_at DESC');
  return result.rows;
}


async function insert(payload) {
  const keys = Object.keys(payload);
  const values = Object.values(payload);
  const params = keys.map((_, i) => `$${i + 1}`).join(', ');
  const query = `INSERT INTO bots (${keys.join(', ')}) VALUES (${params}) RETURNING *`;
  const result = await db.query(query, values);
  return result.rows[0];
}


async function update(id, updatedFields) {
  const keys = Object.keys(updatedFields);
  const values = Object.values(updatedFields);
  const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const query = `UPDATE bots SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
  const result = await db.query(query, [...values, id]);
  return result.rows[0];
}


async function findById(id) {
  const result = await db.query('SELECT * FROM bots WHERE id = $1', [id]);
  return result.rows[0];
}


async function findQrcodeById(id) {
  const result = await db.query('SELECT qrcode FROM bots WHERE id = $1', [id]);
  return result.rows[0];
}


async function remove(id) {
  await db.query('DELETE FROM bots WHERE id = $1', [id]);
  return { success: true };
}

module.exports = {
  listAll,
  insert,
  update,
  findById,
  findQrcodeById,
  remove
};
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
