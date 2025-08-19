const crypto = require('crypto');

/**
 * Middleware de headers de segurança avançados
 */
function securityHeaders(req, res, next) {
  // Gerar nonce único para CSP
  const nonce = crypto.randomBytes(16).toString('base64');
  res.locals.cspNonce = nonce;

  // CSP dinâmico baseado na rota e contexto
  const cspDirectives = generateCSP(req, nonce);
  
  // Headers de segurança
  const headers = {
    // Content Security Policy
    'Content-Security-Policy': cspDirectives,
    
    // HTTP Strict Transport Security
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // X-Content-Type-Options
    'X-Content-Type-Options': 'nosniff',
    
    // X-Frame-Options
    'X-Frame-Options': 'DENY',
    
    // X-XSS-Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()',
    
    // Cache Control para APIs
    'Cache-Control': req.path.startsWith('/api/') ? 'no-cache, no-store, must-revalidate' : 'public, max-age=3600',
    
    // X-Permitted-Cross-Domain-Policies
    'X-Permitted-Cross-Domain-Policies': 'none',
    
    // X-Download-Options
    'X-Download-Options': 'noopen',
    
    // X-DNS-Prefetch-Control
    'X-DNS-Prefetch-Control': 'off',
    
    // X-Robots-Tag
    'X-Robots-Tag': 'noindex, nofollow',
    
    // Clear-Site-Data (para logout)
    ...(req.path === '/api/auth/logout' && {
      'Clear-Site-Data': '"cache", "cookies", "storage"'
    })
  };

  // Aplicar headers
  Object.entries(headers).forEach(([key, value]) => {
    if (value) {
      res.setHeader(key, value);
    }
  });

  next();
}

/**
 * Gera CSP dinâmico baseado no contexto
 */
function generateCSP(req, nonce) {
  const baseDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      `'nonce-${nonce}'`,
      "'unsafe-inline'", // Necessário para alguns frameworks
      'https://cdn.jsdelivr.net',
      'https://unpkg.com'
    ],
    'style-src': [
      "'self'",
      "'unsafe-inline'",
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net'
    ],
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net'
    ],
    'img-src': [
      "'self'",
      'data:',
      'https:',
      'blob:'
    ],
    'connect-src': [
      "'self'",
      'ws:',
      'wss:',
      'https://api.example.com'
    ],
    'frame-src': ["'none'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'upgrade-insecure-requests': []
  };

  // Adicionar diretivas específicas por rota
  if (req.path.startsWith('/api/')) {
    baseDirectives['connect-src'].push('https://api.external.com');
  }

  if (req.path.includes('/upload')) {
    baseDirectives['img-src'].push('https://storage.googleapis.com');
  }

  if (req.path.includes('/analytics')) {
    baseDirectives['script-src'].push('https://www.google-analytics.com');
    baseDirectives['connect-src'].push('https://www.google-analytics.com');
  }

  // Converter para string
  return Object.entries(baseDirectives)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * Middleware para rate limiting baseado em IP e usuário
 */
function rateLimitByUser(req, res, next) {
  const key = req.user?.id || req.ip;
  const windowMs = 15 * 60 * 1000; // 15 minutos
  const maxRequests = req.user ? 1000 : 100; // Mais requisições para usuários autenticados

  // Implementação básica - em produção usar Redis
  if (!req.app.locals.rateLimit) {
    req.app.locals.rateLimit = new Map();
  }

  const now = Date.now();
  const userRequests = req.app.locals.rateLimit.get(key) || [];

  // Remover requisições antigas
  const recentRequests = userRequests.filter(time => now - time < windowMs);

  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      retryAfter: Math.ceil(windowMs / 1000)
    });
  }

  recentRequests.push(now);
  req.app.locals.rateLimit.set(key, recentRequests);

  // Adicionar headers de rate limit
  res.setHeader('X-RateLimit-Limit', maxRequests);
  res.setHeader('X-RateLimit-Remaining', maxRequests - recentRequests.length);
  res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());

  next();
}

/**
 * Middleware para validação de origem
 */
function validateOrigin(req, res, next) {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://yourdomain.com',
    'https://app.yourdomain.com'
  ];

  const origin = req.get('Origin');
  
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      error: 'Origin not allowed',
      allowedOrigins
    });
  }

  next();
}

/**
 * Middleware para proteção contra ataques comuns
 */
function securityProtection(req, res, next) {
  // Proteção contra SQL Injection (básica)
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i;
  const body = JSON.stringify(req.body);
  
  if (sqlPattern.test(body)) {
    return res.status(400).json({
      error: 'Invalid request content'
    });
  }

  // Proteção contra XSS (básica)
  const xssPattern = /<script|javascript:|vbscript:|onload=|onerror=/i;
  if (xssPattern.test(body)) {
    return res.status(400).json({
      error: 'Invalid request content'
    });
  }

  // Proteção contra NoSQL Injection
  const nosqlPattern = /\$where|\$ne|\$gt|\$lt|\$regex/i;
  if (nosqlPattern.test(body)) {
    return res.status(400).json({
      error: 'Invalid request content'
    });
  }

  // Sanitizar headers
  const dangerousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-forwarded-proto'];
  dangerousHeaders.forEach(header => {
    if (req.headers[header]) {
      delete req.headers[header];
    }
  });

  next();
}

/**
 * Middleware para logging de segurança
 */
function securityLogging(req, res, next) {
  const securityEvents = [];
  
  // Detectar possíveis ataques
  if (req.headers['user-agent']?.includes('sqlmap')) {
    securityEvents.push('SQLMap detected');
  }

  if (req.headers['user-agent']?.includes('nikto')) {
    securityEvents.push('Nikto detected');
  }

  if (req.headers['user-agent']?.includes('nmap')) {
    securityEvents.push('Nmap detected');
  }

  // Log de eventos de segurança
  if (securityEvents.length > 0) {
    console.warn('Security events detected:', {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      events: securityEvents,
      timestamp: new Date().toISOString()
    });
  }

  next();
}

/**
 * Middleware para validação de tokens CSRF
 */
function csrfProtection(req, res, next) {
  // Pular para métodos seguros
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Verificar token CSRF
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
    return res.status(403).json({
      error: 'CSRF token validation failed'
    });
  }

  next();
}

module.exports = {
  securityHeaders,
  rateLimitByUser,
  validateOrigin,
  securityProtection,
  securityLogging,
  csrfProtection
};

