const request = require('supertest');
const app = require('../index.cjs');
const { createClient } = require('@supabase/supabase-js');

// Mock do Supabase
jest.mock('@supabase/supabase-js');

// Mock do logger
jest.mock('../logger.cjs', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Mock do botManager
jest.mock('../services/botManager.cjs', () => ({
  startSession: jest.fn(),
  stopSession: jest.fn(),
  getQrcode: jest.fn(),
  getLogs: jest.fn(),
  isSessionActive: jest.fn(),
}));

// Mock do repositório
jest.mock('../repositories/botsRepository.cjs', () => ({
  listAll: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findQrcodeById: jest.fn(),
  remove: jest.fn(),
}));

// Mock do repositório de logs
jest.mock('../repositories/botLogsRepository.cjs', () => ({
  listByBotId: jest.fn(),
  insert: jest.fn(),
}));

const botsRepo = require('../repositories/botsRepository.cjs');
const botLogsRepo = require('../repositories/botLogsRepository.cjs');
const { startSession, stopSession, getQrcode, getLogs, isSessionActive } = require('../services/botManager.cjs');

// Mock JWT token
const mockToken = 'mock-jwt-token';

// Mock user
const mockUser = {
  id: '1',
  email: 'test@example.com',
  role: 'admin',
};

// Mock bots data
const mockBots = [
  {
    id: '1',
    name: 'Bot Teste 1',
    session_name: 'bot_teste_1',
    qrcode: null,
    is_active: false,
    description: 'Bot de teste',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Bot Teste 2',
    session_name: 'bot_teste_2',
    qrcode: 'data:image/png;base64,test',
    is_active: true,
    description: 'Bot ativo de teste',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

describe('Bots API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock do middleware de autenticação
    app.use((req, res, next) => {
      req.user = mockUser;
      next();
    });
  });

  describe('GET /api/bots', () => {
    it('should return list of bots', async () => {
      botsRepo.listAll.mockResolvedValue(mockBots);

      const response = await request(app)
        .get('/api/bots')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockBots);
      expect(botsRepo.listAll).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      botsRepo.listAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/bots')
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/bots', () => {
    it('should create a new bot', async () => {
      const newBot = {
        name: 'Novo Bot',
        type: 'whatsapp',
        description: 'Bot criado via teste',
      };

      const createdBot = {
        id: '3',
        ...newBot,
        session_name: null,
        qrcode: null,
        is_active: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      botsRepo.insert.mockResolvedValue(createdBot);

      const response = await request(app)
        .post('/api/bots')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(newBot);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, bot: createdBot });
      expect(botsRepo.insert).toHaveBeenCalledWith(newBot);
    });

    it('should validate required fields', async () => {
      const invalidBot = {
        description: 'Bot sem nome',
      };

      const response = await request(app)
        .post('/api/bots')
        .set('Authorization', `Bearer ${mockToken}`)
        .send(invalidBot);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/bots/:id/start', () => {
    it('should start a bot session', async () => {
      const botId = '1';
      const qrCode = 'data:image/png;base64,test-qr';

      botsRepo.findById.mockResolvedValue(mockBots[0]);
      startSession.mockResolvedValue(qrCode);

      const response = await request(app)
        .post(`/api/bots/${botId}/start`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Sessão iniciada',
        qrcode: qrCode,
      });
      expect(startSession).toHaveBeenCalledWith({
        id: botId,
        session_name: mockBots[0].session_name,
      });
    });

    it('should handle bot not found', async () => {
      const botId = '999';
      botsRepo.findById.mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/bots/${botId}/start`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should handle start session errors', async () => {
      const botId = '1';
      botsRepo.findById.mockResolvedValue(mockBots[0]);
      startSession.mockRejectedValue(new Error('Start session error'));

      const response = await request(app)
        .post(`/api/bots/${botId}/start`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/bots/:id/stop', () => {
    it('should stop a bot session', async () => {
      const botId = '1';
      stopSession.mockResolvedValue();

      const response = await request(app)
        .post(`/api/bots/${botId}/stop`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Sessão encerrada' });
      expect(stopSession).toHaveBeenCalledWith(botId);
    });

    it('should handle stop session errors', async () => {
      const botId = '1';
      stopSession.mockRejectedValue(new Error('Stop session error'));

      const response = await request(app)
        .post(`/api/bots/${botId}/stop`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/bots/:id/status', () => {
    it('should return bot status', async () => {
      const botId = '1';
      isSessionActive.mockReturnValue(true);

      const response = await request(app)
        .get(`/api/bots/${botId}/status`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ active: true });
      expect(isSessionActive).toHaveBeenCalledWith(botId);
    });
  });

  describe('GET /api/bots/:id/qrcode', () => {
    it('should return QR code from memory', async () => {
      const botId = '1';
      const qrCode = 'data:image/png;base64,test-qr';
      getQrcode.mockReturnValue(qrCode);

      const response = await request(app)
        .get(`/api/bots/${botId}/qrcode`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ qrcode });
      expect(getQrcode).toHaveBeenCalledWith(botId);
    });

    it('should return QR code from database when not in memory', async () => {
      const botId = '1';
      const qrCode = 'data:image/png;base64,test-qr';
      
      getQrcode.mockReturnValue(null);
      botsRepo.findQrcodeById.mockResolvedValue({ qrcode });

      const response = await request(app)
        .get(`/api/bots/${botId}/qrcode`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ qrcode });
      expect(botsRepo.findQrcodeById).toHaveBeenCalledWith(botId);
    });

    it('should return 404 when QR code not available', async () => {
      const botId = '1';
      getQrcode.mockReturnValue(null);
      botsRepo.findQrcodeById.mockResolvedValue(null);

      const response = await request(app)
        .get(`/api/bots/${botId}/qrcode`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/bots/:id/logs', () => {
    it('should return bot logs', async () => {
      const botId = '1';
      const memoryLogs = [
        { timestamp: '2024-01-01T00:00:00Z', direction: 'received', message: 'Olá', type: 'text' },
      ];
      const dbLogs = [
        { timestamp: '2024-01-01T00:01:00Z', direction: 'sent', message: 'Oi!', type: 'text' },
      ];

      getLogs.mockReturnValue(memoryLogs);
      botLogsRepo.listByBotId.mockResolvedValue(dbLogs);

      const response = await request(app)
        .get(`/api/bots/${botId}/logs`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ logs: [...dbLogs, ...memoryLogs] });
      expect(getLogs).toHaveBeenCalledWith(botId);
      expect(botLogsRepo.listByBotId).toHaveBeenCalledWith(botId, 100);
    });

    it('should handle database errors gracefully', async () => {
      const botId = '1';
      const memoryLogs = [
        { timestamp: '2024-01-01T00:00:00Z', direction: 'received', message: 'Olá', type: 'text' },
      ];

      getLogs.mockReturnValue(memoryLogs);
      botLogsRepo.listByBotId.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get(`/api/bots/${botId}/logs`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ logs: memoryLogs });
    });
  });

  describe('DELETE /api/bots/:id', () => {
    it('should delete a bot', async () => {
      const botId = '1';
      botsRepo.findById.mockResolvedValue(mockBots[0]);
      botsRepo.remove.mockResolvedValue({ success: true });
      isSessionActive.mockReturnValue(false);

      const response = await request(app)
        .delete(`/api/bots/${botId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(botsRepo.remove).toHaveBeenCalledWith(botId);
    });

    it('should stop active session before deleting', async () => {
      const botId = '1';
      botsRepo.findById.mockResolvedValue(mockBots[0]);
      botsRepo.remove.mockResolvedValue({ success: true });
      isSessionActive.mockReturnValue(true);

      const response = await request(app)
        .delete(`/api/bots/${botId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true });
      expect(stopSession).toHaveBeenCalledWith(botId);
      expect(botsRepo.remove).toHaveBeenCalledWith(botId);
    });

    it('should handle bot not found', async () => {
      const botId = '999';
      botsRepo.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete(`/api/bots/${botId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });
});