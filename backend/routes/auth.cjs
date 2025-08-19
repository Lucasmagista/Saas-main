const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate.cjs');
const jwtService = require('../services/jwtService.cjs');
const authRepository = require('../repositories/authRepository.cjs');
const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');

const router = express.Router();

// Schemas de validação
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  full_name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token é obrigatório'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

// POST /auth/login
router.post('/login', validate({ body: loginSchema }), async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info('Tentativa de login:', { email });

    // Buscar usuário
    const user = await authRepository.findByEmail(email);
    if (!user) {
      logger.warn('Tentativa de login com email inexistente:', { email });
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar senha
    const isValidPassword = await jwtService.verifyPassword(password, user.password);
    if (!isValidPassword) {
      logger.warn('Tentativa de login com senha incorreta:', { email });
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verificar se usuário está ativo
    if (!user.is_active) {
      logger.warn('Tentativa de login com usuário inativo:', { email });
      return res.status(401).json({
        success: false,
        error: 'Conta desativada',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Gerar tokens
    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role || 'user',
    };

    const tokens = jwtService.generateTokenPair(payload);

    // Log de sucesso
    logger.info('Login realizado com sucesso:', { email, userId: user.id });

    // Auditoria
    await logAudit({
      req,
      action: 'login',
      resourceType: 'auth',
      resourceId: user.id,
      newValues: { email, success: true }
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      ...tokens,
      user: payload
    });

  } catch (error) {
    logger.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /auth/register
router.post('/register', validate({ body: registerSchema }), async (req, res) => {
  try {
    const { email, password, full_name } = req.body;

    logger.info('Tentativa de registro:', { email });

    // Verificar se email já existe
    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      logger.warn('Tentativa de registro com email existente:', { email });
      return res.status(409).json({
        success: false,
        error: 'Email já cadastrado',
        code: 'EMAIL_EXISTS'
      });
    }

    // Hash da senha
    const hashedPassword = await jwtService.hashPassword(password);

    // Criar usuário
    const user = await authRepository.createUser({
      email,
      password: hashedPassword,
      full_name,
      role: 'user',
      is_active: true,
    });

    // Gerar tokens
    const payload = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    };

    const tokens = jwtService.generateTokenPair(payload);

    // Log de sucesso
    logger.info('Registro realizado com sucesso:', { email, userId: user.id });

    // Auditoria
    await logAudit({
      req,
      action: 'register',
      resourceType: 'auth',
      resourceId: user.id,
      newValues: { email, full_name }
    });

    res.status(201).json({
      success: true,
      message: 'Conta criada com sucesso',
      ...tokens,
      user: payload
    });

  } catch (error) {
    logger.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /auth/refresh
router.post('/refresh', validate({ body: refreshTokenSchema }), async (req, res) => {
  try {
    const { refreshToken } = req.body;

    logger.info('Tentativa de renovação de token');

    // Verificar e renovar token
    const tokens = jwtService.refreshAccessToken(refreshToken);

    // Log de sucesso
    logger.info('Token renovado com sucesso:', { userId: tokens.user?.id });

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      ...tokens
    });

  } catch (error) {
    logger.error('Erro na renovação de token:', error);
    
    if (error.message.includes('expirado') || error.message.includes('inválido')) {
      return res.status(401).json({
        success: false,
        error: error.message,
        code: 'INVALID_REFRESH_TOKEN'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /auth/logout
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);

    if (token) {
      // Em uma implementação mais robusta, você poderia invalidar o token
      // Por exemplo, adicionando à blacklist ou usando Redis
      logger.info('Logout realizado:', { userId: req.user?.id });
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    logger.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), async (req, res) => {
  try {
    const { email } = req.body;

    logger.info('Solicitação de recuperação de senha:', { email });

    // Verificar se usuário existe
    const user = await authRepository.findByEmail(email);
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      logger.info('Solicitação de recuperação para email inexistente:', { email });
      return res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá instruções de recuperação'
      });
    }

    // Gerar token de recuperação
    const resetToken = jwtService.generateAccessToken({
      id: user.id,
      email: user.email,
      type: 'password_reset'
    });

    // Em uma implementação completa, você enviaria o email aqui
    // Por enquanto, apenas logamos
    logger.info('Token de recuperação gerado:', { email, resetToken });

    res.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá instruções de recuperação'
    });

  } catch (error) {
    logger.error('Erro na recuperação de senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /auth/reset-password
router.post('/reset-password', validate({ body: resetPasswordSchema }), async (req, res) => {
  try {
    const { token, password } = req.body;

    logger.info('Tentativa de redefinição de senha');

    // Verificar token
    const decoded = jwtService.verifyAccessToken(token);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        success: false,
        error: 'Token inválido',
        code: 'INVALID_TOKEN'
      });
    }

    // Buscar usuário
    const user = await authRepository.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Hash da nova senha
    const hashedPassword = await jwtService.hashPassword(password);

    // Atualizar senha
    await authRepository.updateUser(user.id, { password: hashedPassword });

    // Log de sucesso
    logger.info('Senha redefinida com sucesso:', { email: user.email });

    // Auditoria
    await logAudit({
      req,
      action: 'reset_password',
      resourceType: 'auth',
      resourceId: user.id,
      newValues: { email: user.email }
    });

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    logger.error('Erro na redefinição de senha:', error);
    
    if (error.message.includes('expirado') || error.message.includes('inválido')) {
      return res.status(400).json({
        success: false,
        error: 'Token inválido ou expirado',
        code: 'INVALID_TOKEN'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// GET /auth/me
router.get('/me', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Buscar dados atualizados do usuário
    const user = await authRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    const userData = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_active: user.is_active,
    };

    res.json({
      success: true,
      user: userData
    });

  } catch (error) {
    logger.error('Erro ao buscar dados do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

// POST /auth/change-password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado',
        code: 'NOT_AUTHENTICATED'
      });
    }

    // Buscar usuário
    const user = await authRepository.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar senha atual
    const isValidPassword = await jwtService.verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual incorreta',
        code: 'INVALID_PASSWORD'
      });
    }

    // Hash da nova senha
    const hashedPassword = await jwtService.hashPassword(newPassword);

    // Atualizar senha
    await authRepository.updateUser(user.id, { password: hashedPassword });

    // Log de sucesso
    logger.info('Senha alterada com sucesso:', { email: user.email });

    // Auditoria
    await logAudit({
      req,
      action: 'change_password',
      resourceType: 'auth',
      resourceId: user.id,
      newValues: { email: user.email }
    });

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    logger.error('Erro na alteração de senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    });
  }
});

module.exports = router;
