// Repositório para acesso à tabela 'whatsapp_logs' no PostgreSQL
const postgresClient = require('../postgresClient.cjs');

async function insert(log) {
  const query = `
    INSERT INTO whatsapp_logs (bot_id, direction, message, type, number, created_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  
  const values = [
    log.bot_id,
    log.direction,
    log.message,
    log.type,
    log.number,
    log.created_at || new Date().toISOString()
  ];
  
  try {
    const result = await postgresClient.query(query, values);
    return result.rows[0];
  } catch (error) {
    throw new Error(`Erro ao inserir log do WhatsApp: ${error.message}`);
  }
}

async function listByNumber(number, limit = 50) {
  const query = `
    SELECT * FROM whatsapp_logs 
    WHERE number = $1 
    ORDER BY created_at DESC 
    LIMIT $2
  `;
  
  try {
    const result = await postgresClient.query(query, [number, limit]);
    return result.rows;
  } catch (error) {
    throw new Error(`Erro ao listar logs do WhatsApp: ${error.message}`);
  }
}

module.exports = { insert, listByNumber };
