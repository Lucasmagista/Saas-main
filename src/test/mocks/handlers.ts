import { rest } from 'msw';

const API_BASE = 'http://localhost:3002/api';

// Mock data
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

const mockUser = {
  id: '1',
  email: 'test@example.com',
  full_name: 'Usuário Teste',
  role: 'admin',
};

const mockAuthResponse = {
  success: true,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  user: mockUser,
};

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE}/auth/login`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockAuthResponse));
  }),

  rest.post(`${API_BASE}/auth/register`, (req, res, ctx) => {
    return res(ctx.status(201), ctx.json(mockAuthResponse));
  }),

  rest.post(`${API_BASE}/auth/refresh`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      success: true,
      accessToken: 'new-mock-access-token',
    }));
  }),

  // Bots endpoints
  rest.get(`${API_BASE}/bots`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockBots));
  }),

  rest.get(`${API_BASE}/bots/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const bot = mockBots.find(b => b.id === id);
    
    if (!bot) {
      return res(ctx.status(404), ctx.json({ error: 'Bot não encontrado' }));
    }
    
    return res(ctx.status(200), ctx.json(bot));
  }),

  rest.post(`${API_BASE}/bots`, (req, res, ctx) => {
    const newBot = {
      id: '3',
      name: 'Novo Bot',
      session_name: 'novo_bot',
      qrcode: null,
      is_active: false,
      description: 'Bot criado via teste',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    return res(ctx.status(201), ctx.json({ success: true, bot: newBot }));
  }),

  rest.post(`${API_BASE}/bots/:id/start`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      message: 'Sessão iniciada',
      qrcode: 'data:image/png;base64,test-qr',
    }));
  }),

  rest.post(`${API_BASE}/bots/:id/stop`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Sessão encerrada' }));
  }),

  rest.get(`${API_BASE}/bots/:id/status`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ active: true }));
  }),

  rest.get(`${API_BASE}/bots/:id/qrcode`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ qrcode: 'data:image/png;base64,test-qr' }));
  }),

  rest.get(`${API_BASE}/bots/:id/logs`, (req, res, ctx) => {
    const mockLogs = [
      {
        timestamp: '2024-01-01T00:00:00Z',
        direction: 'received',
        message: 'Olá!',
        type: 'text',
      },
      {
        timestamp: '2024-01-01T00:01:00Z',
        direction: 'sent',
        message: 'Oi! Como posso ajudar?',
        type: 'text',
      },
    ];
    
    return res(ctx.status(200), ctx.json({ logs: mockLogs }));
  }),

  // User endpoints
  rest.get(`${API_BASE}/user/profile`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUser));
  }),

  // Webhook endpoints
  rest.post(`${API_BASE}/whatsapp/webhook`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ success: true }));
  }),

  rest.get(`${API_BASE}/whatsapp/webhook/test`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({
      status: 'ok',
      message: 'Webhook endpoint funcionando',
      database: 'connected',
      activeWebhooks: 2,
    }));
  }),

  // Fallback para rotas não mockadas
  rest.all('*', (req, res, ctx) => {
    console.warn(`Unhandled ${req.method} request to ${req.url}`);
    return res(ctx.status(404), ctx.json({ error: 'Endpoint não encontrado' }));
  }),
];