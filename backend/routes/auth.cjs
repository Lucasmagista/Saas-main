const express = require('express');
const router = express.Router();
const authRepo = require('../repositories/authRepository.cjs');
const authenticateJWT = require('../middleware/authenticateJWT.cjs');
const jwtService = require('../services/jwtService.cjs');
// const { auditLog } = require('../middleware/auditMiddleware');

// Middleware adicional para CORS específico das rotas de auth
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// POST /api/auth/login
router.post('/login', express.json(), async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await authRepo.signInWithPassword(email, password);
    // await auditLog(req, 'login', { email: req.body.email });
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresIn: data.expiresIn,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
        position: data.user.position,
        full_name: data.user.full_name,
        all_roles: data.user.all_roles
      }
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/auth/register
router.post('/register', express.json(), async (req, res) => {
  const { email, password } = req.body;
  try {
    const data = await authRepo.signUp(email, password);
    // await auditLog(req, 'register', { email: req.body.email });
    
    if (data.message) {
      // Email confirmation required
      res.json({
        success: true,
        message: data.message,
        user: {
          id: data.user.id,
          email: data.user.email
        }
      });
    } else {
      // Account confirmed automatically
      res.json({
        success: true,
        message: 'Conta criada com sucesso',
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role || 'user'
        }
      });
    }
  } catch (error) {
    return res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/auth/refresh
router.post('/refresh', express.json(), async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token é obrigatório'
    });
  }

  try {
    const result = await authRepo.refreshTokens(refreshToken);
    res.json({
      success: true,
      message: 'Tokens renovados com sucesso',
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresIn: result.expiresIn,
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role || 'user'
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/logout
router.post('/logout', express.json(), async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    const result = await authRepo.logout(refreshToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/auth/logout-all
router.post('/logout-all', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.user;
    const result = await authRepo.logoutAllDevices(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/auth/me
router.get('/me', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.user;
    const data = await authRepo.getUserById(id);
    res.json({ 
      success: true, 
      data: {
        id: data.id,
        email: data.email,
        role: data.role || 'user',
        created_at: data.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// GET /api/auth/token-stats (para debug/admin)
router.get('/token-stats', authenticateJWT, async (req, res) => {
  try {
    // Só admins podem ver estatísticas
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    
    const stats = jwtService.getTokenStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
