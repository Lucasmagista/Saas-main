// Repositório para acesso à tabela 'qr_codes' no PostgreSQL
const postgresClient = require('../postgresClient.cjs');

async function insert(qr) {
  const query = `
    INSERT INTO qr_codes (bot_id, qr_data, created_at)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  
  const values = [
    qr.bot_id,
    qr.qr_data,
    qr.created_at || new Date().toISOString()
  ];
  
  try {
    const result = await postgresClient.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Erro ao inserir QR code: ${error.message}`);
  }
}

async function listByBot(bot_id, limit = 10) {
  const query = `
    SELECT * FROM qr_codes 
    WHERE bot_id = $1 
    ORDER BY created_at DESC 
    LIMIT $2
  `;
  
  try {
    const result = await postgresClient.query(query, [bot_id, limit]);
    return result.rows;
  } catch (error) {
    throw new Error(`Erro ao listar QR codes: ${error.message}`);
  }
}

module.exports = { insert, listByBot };
