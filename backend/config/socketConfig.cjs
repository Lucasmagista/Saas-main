/**
 * Configurações centralizadas para Socket.IO
 * Otimizadas para reduzir conexões/desconexões frequentes
 */

module.exports = {
  // Configurações de ping/pong para manter conexão estável
  pingTimeout: 120000, // 2 minutos - tempo para aguardar pong (aumentado)
  pingInterval: 25000, // 25 segundos - intervalo entre pings
  
  // Configurações de transporte
  transports: ['websocket', 'polling'],
  
  // Configurações de upgrade
  allowUpgrades: true,
  upgradeTimeout: 30000,
  
  // Buffer de conexão
  maxHttpBufferSize: 1e6, // 1MB
  
  // Configurações de reconexão
  connectTimeout: 45000,
  
  // Configurações para evitar desconexões por inatividade
  serveClient: false, // Não servir arquivos client
  
  // Configurações de CORS
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:8080", 
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8080", 
      "http://127.0.0.1:5173"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  
  // Configurações para controle de flood
  heartbeatTimeout: 120000, // 2 minutos
  heartbeatInterval: 25000, // 25 segundos
  
  // Configurações para evitar spam de conexões
  maxListeners: 100,
  
  // Configurações adicionais para estabilidade
  allowEIO3: true, // Compatibilidade com Engine.IO v3
  allowRequest: (req, callback) => {
    // Validações adicionais podem ser implementadas aqui
    callback(null, true);
  }
};
