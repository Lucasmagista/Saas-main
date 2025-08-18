const { onMessageReceived } = require('./services/wppconnect.cjs');
const socketIo = require('socket.io');
const socketConfig = require('./config/socketConfig.cjs');
const logger = require('./logger.cjs');

/**
 * Inicializa um servidor Socket.IO anexado ao servidor HTTP. Cada
 * conexão de cliente escutará pelo evento `message` para obter
 * mensagens em tempo real. Sempre que o serviço WPPConnect
 * reportar uma nova mensagem (via callback), ela é emitida para
 * todos os clientes conectados. Implementa controle de conexão única
 * por usuário para evitar múltiplas conexões simultâneas.
 *
 * @param {import('http').Server} server Servidor HTTP ao qual o socket será anexado.
 */
module.exports = function setupSocket(server) {
  const io = new socketIo.Server(server, socketConfig);

  // Map para controlar conexões ativas por usuário
  const activeConnections = new Map();

  // Middleware de autenticação do socket. Verifica o token JWT no handshake.
  // Importa configuração global (inclui jwtSecret) uma única vez
  const { jwtSecret } = require('./config.cjs');
  const rateLimitConnections = require('./middleware/rateLimitSocket.cjs');
  
  io.use((socket, next) => {
    try {
      // Recupera o token do handshake. Pode ser enviado em auth ou no header Authorization
      const token = socket.handshake.auth?.token || (socket.handshake.headers?.authorization ? socket.handshake.headers.authorization.split('Bearer ')[1] : null);
      if (!token) {
        return next(new Error('Token não fornecido'));
      }
      const decoded = require('jsonwebtoken').verify(token, jwtSecret);
      if (!decoded || !decoded.id) {
        return next(new Error('Token inválido'));
      }
      
      // Define o userId no socket
      socket.userId = decoded.id;
      
      // Verifica se já existe uma conexão ativa para este usuário
      const existingSocket = activeConnections.get(socket.userId);
      if (existingSocket && existingSocket.connected) {
        logger.warn(`Desconectando conexão anterior do usuário ${socket.userId}`);
        existingSocket.disconnect(true);
      }
      
      // Registra a nova conexão
      activeConnections.set(socket.userId, socket);
      
      // Inclui o socket na sala do usuário para isolamento
      socket.join(String(socket.userId));
      return next();
    } catch (err) {
      logger.error('Erro na autenticação do socket:', err.message);
      return next(new Error('Token inválido ou expirado'));
    }
  });

  // Aplica rate limiting após autenticação
  io.use(rateLimitConnections);

  io.on('connection', (socket) => {
    // Conexão estabelecida com usuário autenticado
    logger.info(`WebSocket conectado: ${socket.id} - Usuário: ${socket.userId}`);
    
    // Eventos de heartbeat para manter conexão ativa
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Evento personalizado para identificar reconexões
    socket.on('client-reconnect', (data) => {
      logger.info(`Cliente reconectado: ${socket.userId}, tentativa: ${data?.attempt || 'não informado'}`);
    });

    // Manipula desconexão
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket desconectado: ${socket.id} - Usuário: ${socket.userId} - Motivo: ${reason}`);
      
      // Remove da lista de conexões ativas apenas se for esta conexão
      const currentConnection = activeConnections.get(socket.userId);
      if (currentConnection && currentConnection.id === socket.id) {
        activeConnections.delete(socket.userId);
      }
    });

    // Cleanup quando socket for destruído
    socket.on('error', (error) => {
      logger.error(`Erro no socket ${socket.id}:`, error.message);
      activeConnections.delete(socket.userId);
    });
  });

  // Envia nova mensagem recebida do serviço WPP para cada usuário conectado
  onMessageReceived((msg) => {
    // Emite a mensagem para cada sala de usuário conectada, garantindo isolamento
    // e evitando broadcast global. A mensagem deve incluir identificação de destino
    // para que o cliente filtre se necessário.
    io.sockets.sockets.forEach((sock) => {
      if (sock.userId) {
        io.to(String(sock.userId)).emit('message', msg);
      }
    });
  });

  // (Opcional) Suporte a cluster com Redis. Se a dependência não estiver instalada,
  // a configuração é ignorada silenciosamente. Para habilitar, defina REDIS_HOST
  // e REDIS_PORT no .env e instale @socket.io/redis-adapter e redis.
  try {
    const config = require('./config.cjs');
    const redisHost = process.env.REDIS_HOST || config.redisHost;
    const redisPort = process.env.REDIS_PORT || config.redisPort;
    if (redisHost && redisPort) {
      const { createAdapter } = require('@socket.io/redis-adapter');
      const { createClient } = require('redis');
      // Cria clientes de publicação/assinatura
      const pubClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
      const subClient = pubClient.duplicate();
      // Conecta ao Redis de forma assíncrona
      Promise.all([pubClient.connect(), subClient.connect()])
        .then(() => {
          io.adapter(createAdapter(pubClient, subClient));
          console.log('Socket.IO configurado para cluster via Redis');
        })
        .catch((err) => {
          console.warn('Falha ao conectar ao Redis para cluster Socket.IO:', err);
        });
    }
  } catch (err) {
    // Dependências do Redis não instaladas ou configuração ausente
    console.debug('Redis adapter não configurado:', err.message);
  }
};
