const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate.cjs');
const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const authRepo = require('../repositories/authRepository.cjs');
const jwtService = require('../services/jwtService.cjs');
const refreshTokenService = require('../services/refreshTokenService.cjs');
const { rateLimiters } = require('../middleware/rateLimit.cjs');
const { idempotency } = require('../middleware/idempotency.cjs');

const router = express.Router();

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const registerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
  familyId: z.string().uuid('Family ID inválido'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
});

// POST /login
router.post('/login', rateLimiters.auth, idempotency(), validate({ body: loginSchema }), async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await authRepo.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const isValidPassword = await jwtService.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Gerar par de tokens
    const tokenPair = await refreshTokenService.generateTokenPair(
      user.id, 
      req.ip, 
      req.get('User-Agent')
    );

    await logAudit({ 
      req, 
      action: 'login', 
      resourceType: 'user', 
      resourceId: user.id,
      newValues: { email: user.email }
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        familyId: tokenPair.familyId,
        expiresAt: tokenPair.expiresAt
      }
    });
  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /register
router.post('/register', rateLimiters.auth, idempotency(), validate({ body: registerSchema }), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await authRepo.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await jwtService.hashPassword(password);
    const user = await authRepo.createUser({ name, email, password: hashedPassword });

    // Gerar par de tokens
    const tokenPair = await refreshTokenService.generateTokenPair(
      user.id, 
      req.ip, 
      req.get('User-Agent')
    );

    await logAudit({ 
      req, 
      action: 'register', 
      resourceType: 'user', 
      resourceId: user.id,
      newValues: { email: user.email, name: user.name }
    });

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        familyId: tokenPair.familyId,
        expiresAt: tokenPair.expiresAt
      }
    });
  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /refresh
router.post('/refresh', rateLimiters.auth, validate({ body: refreshSchema }), async (req, res) => {
  try {
    const { refreshToken, familyId } = req.body;
    
    const tokenPair = await refreshTokenService.refreshTokens(refreshToken, familyId);

    res.json({
      success: true,
      tokens: {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        familyId: tokenPair.familyId,
        expiresAt: tokenPair.expiresAt
      }
    });
  } catch (error) {
    logger.error('Erro no refresh:', error);
    res.status(401).json({ error: 'Token inválido ou expirado' });
  }
});

// POST /logout
router.post('/logout', idempotency(), async (req, res) => {
  try {
    const { familyId } = req.body;
    
    if (familyId) {
      await refreshTokenService.revokeToken(familyId);
    }

    res.json({ success: true, message: 'Logout realizado com sucesso' });
  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /logout-all
router.post('/logout-all', idempotency(), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    await refreshTokenService.revokeAllUserTokens(req.user.id);

    res.json({ success: true, message: 'Todos os dispositivos desconectados' });
  } catch (error) {
    logger.error('Erro no logout-all:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /me
router.get('/me', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = await authRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /tokens
router.get('/tokens', async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const tokens = await refreshTokenService.getUserTokens(req.user.id);

    res.json({
      success: true,
      tokens: tokens.map(token => ({
        id: token.id,
        familyId: token.family_id,
        ipAddress: token.ip_address,
        userAgent: token.user_agent,
        createdAt: token.created_at,
        expiresAt: token.expires_at
      }))
    });
  } catch (error) {
    logger.error('Erro ao buscar tokens:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /forgot-password
router.post('/forgot-password', rateLimiters.auth, idempotency(), validate({ body: forgotPasswordSchema }), async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await authRepo.findByEmail(email);
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return res.json({ success: true, message: 'Se o email existir, você receberá instruções de recuperação' });
    }

    // TODO: Implementar envio de email com token de reset
    // Por enquanto, apenas log
    logger.info('Password reset requested', { email, userId: user.id });

    res.json({ success: true, message: 'Se o email existir, você receberá instruções de recuperação' });
  } catch (error) {
    logger.error('Erro no forgot-password:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /reset-password
router.post('/reset-password', rateLimiters.auth, idempotency(), validate({ body: resetPasswordSchema }), async (req, res) => {
  try {
    const { token, password } = req.body;
    
    // TODO: Implementar validação do token de reset
    // Por enquanto, apenas log
    logger.info('Password reset attempted', { token: token.substring(0, 10) + '...' });

    res.json({ success: true, message: 'Senha alterada com sucesso' });
  } catch (error) {
    logger.error('Erro no reset-password:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /change-password
router.post('/change-password', idempotency(), validate({ body: changePasswordSchema }), async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { currentPassword, newPassword } = req.body;
    
    const user = await authRepo.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const isValidPassword = await jwtService.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Senha atual incorreta' });
    }

    const hashedNewPassword = await jwtService.hashPassword(newPassword);
    await authRepo.updatePassword(req.user.id, hashedNewPassword);

    // Revogar todos os tokens do usuário para forçar novo login
    await refreshTokenService.revokeAllUserTokens(req.user.id);

    await logAudit({ 
      req, 
      action: 'change_password', 
      resourceType: 'user', 
      resourceId: req.user.id 
    });

    res.json({ success: true, message: 'Senha alterada com sucesso. Faça login novamente.' });
  } catch (error) {
    logger.error('Erro no change-password:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
