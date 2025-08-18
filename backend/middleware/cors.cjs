/**
 * Middleware personalizado para CORS
 * Configuração mais robusta para evitar problemas de CORS em desenvolvimento e produção
 */

const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080', 
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
    'http://127.0.0.1:5173'
  ];

  const origin = req.headers.origin;
  
  // Permite qualquer origem em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-CSRF-Token'
  );
  res.header('Access-Control-Expose-Headers', 'Authorization, X-Total-Count');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
};

module.exports = corsMiddleware;
