/**
 * Middleware para controlar a taxa de conexões WebSocket
 * Previne spam de conexões do mesmo usuário
 * Versão melhorada com tolerância a reconexões legítimas
 */

const connectionTracker = new Map();
const logger = require('../logger.cjs');

/**
 * Middleware para rate limiting de conexões WebSocket
 * @param {*} socket 
 * @param {*} next 
 */
function rateLimitConnections(socket, next) {
  const userId = socket.userId;
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxConnections = 15; // Aumentado para 15 conexões por minuto (era 10)
  const gracePeriod = 5000; // 5 segundos de carência para reconexões

  if (!userId) {
    return next();
  }

  const userConnections = connectionTracker.get(userId) || [];
  
  // Remove conexões antigas (fora da janela de tempo)
  const recentConnections = userConnections.filter(
    timestamp => now - timestamp < windowMs
  );

  // Verifica se há muitas conexões muito próximas (possível spam)
  const veryRecentConnections = recentConnections.filter(
    timestamp => now - timestamp < gracePeriod
  );

  // Se há muitas conexões em pouco tempo, é suspeito
  if (veryRecentConnections.length >= 5) {
    logger.warn(`Usuário ${userId} fazendo muitas conexões rápidas: ${veryRecentConnections.length} em ${gracePeriod}ms`);
    return next(new Error('Muitas tentativas de conexão em pouco tempo. Aguarde alguns segundos.'));
  }

  if (recentConnections.length >= maxConnections) {
    logger.warn(`Usuário ${userId} excedeu limite de conexões: ${recentConnections.length}/${maxConnections}`);
    return next(new Error(`Rate limit excedido. Máximo ${maxConnections} conexões por minuto.`));
  }

  // Adiciona a conexão atual
  recentConnections.push(now);
  connectionTracker.set(userId, recentConnections);

  // Log para debug (apenas quando há muitas conexões)
  if (recentConnections.length > 5) {
    logger.info(`Usuário ${userId}: ${recentConnections.length}/${maxConnections} conexões no último minuto`);
  }

  // Limpeza periódica do mapa
  if (Math.random() < 0.05) { // 5% das conexões fazem limpeza (era 1%)
    cleanupConnectionTracker(windowMs);
  }

  next();
}

/**
 * Limpa entradas antigas do tracker
 * @param {number} windowMs 
 */
function cleanupConnectionTracker(windowMs) {
  const now = Date.now();
  for (const [userId, connections] of connectionTracker.entries()) {
    const recentConnections = connections.filter(
      timestamp => now - timestamp < windowMs
    );
    
    if (recentConnections.length === 0) {
      connectionTracker.delete(userId);
    } else {
      connectionTracker.set(userId, recentConnections);
    }
  }
}

module.exports = rateLimitConnections;
