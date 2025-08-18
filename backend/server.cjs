// Inicialização do servidor Express e Socket.IO
const http = require('http');
const app = require('./index.cjs');
const config = require('./config.cjs');
const setupSocket = require('./socket.cjs');
const logger = require('./logger.cjs');

const server = http.createServer(app);
setupSocket(server);

const PORT = config.wppPort || 3002;
server.listen(PORT, () => {
  logger.info(`Servidor WPPConnect rodando na porta ${PORT}`);
});
