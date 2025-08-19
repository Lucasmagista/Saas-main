import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Bots from '../Bots';
import { useBotList } from '@/hooks/useBotList';

// Mock dos hooks
jest.mock('@/hooks/useBotList');
jest.mock('@/hooks/use-toast');

const mockUseBotList = useBotList as jest.MockedFunction<typeof useBotList>;

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

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('Bots Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseBotList.mockReturnValue({
      data: undefined,
      isLoading: true,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<Bots />);
    
    expect(screen.getByText('Carregando bots...')).toBeInTheDocument();
  });

  it('should render empty state when no bots', () => {
    mockUseBotList.mockReturnValue({
      data: [],
      isLoading: false,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<Bots />);
    
    expect(screen.getByText('Nenhum bot cadastrado.')).toBeInTheDocument();
  });

  it('should render bots list', () => {
    mockUseBotList.mockReturnValue({
      data: mockBots,
      isLoading: false,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<Bots />);
    
    expect(screen.getByText('Bot Teste 1')).toBeInTheDocument();
    expect(screen.getByText('Bot Teste 2')).toBeInTheDocument();
    expect(screen.getByText('Bot de teste')).toBeInTheDocument();
    expect(screen.getByText('Bot ativo de teste')).toBeInTheDocument();
  });

  it('should show correct status badges', () => {
    mockUseBotList.mockReturnValue({
      data: mockBots,
      isLoading: false,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<Bots />);
    
    expect(screen.getByText('Inativo')).toBeInTheDocument();
    expect(screen.getByText('Ativo')).toBeInTheDocument();
  });

  it('should show correct buttons for inactive bot', () => {
    mockUseBotList.mockReturnValue({
      data: [mockBots[0]], // Bot inativo
      isLoading: false,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<Bots />);
    
    expect(screen.getByText('Iniciar')).toBeInTheDocument();
    expect(screen.getByText('QR Code')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
  });

  it('should show correct buttons for active bot', () => {
    mockUseBotList.mockReturnValue({
      data: [mockBots[1]], // Bot ativo
      isLoading: false,
      refetch: jest.fn(),
    });

    renderWithQueryClient(<Bots />);
    
    expect(screen.getByText('Parar')).toBeInTheDocument();
    expect(screen.getByText('QR Code')).toBeInTheDocument();
    expect(screen.getByText('Logs')).toBeInTheDocument();
  });

  it('should call start bot when clicking start button', async () => {
    const mockRefetch = jest.fn();
    mockUseBotList.mockReturnValue({
      data: [mockBots[0]],
      isLoading: false,
      refetch: mockRefetch,
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Sessão iniciada' }),
    });

    renderWithQueryClient(<Bots />);
    
    const startButton = screen.getByText('Iniciar');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/bots/1/start',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should call stop bot when clicking stop button', async () => {
    const mockRefetch = jest.fn();
    mockUseBotList.mockReturnValue({
      data: [mockBots[1]],
      isLoading: false,
      refetch: mockRefetch,
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'Sessão encerrada' }),
    });

    renderWithQueryClient(<Bots />);
    
    const stopButton = screen.getByText('Parar');
    fireEvent.click(stopButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3002/bots/2/stop',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });
  });

  it('should show QR code dialog when clicking QR button', async () => {
    mockUseBotList.mockReturnValue({
      data: [mockBots[1]],
      isLoading: false,
      refetch: jest.fn(),
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ qrcode: 'data:image/png;base64,test-qr' }),
    });

    renderWithQueryClient(<Bots />);
    
    const qrButton = screen.getByText('QR Code');
    fireEvent.click(qrButton);

    await waitFor(() => {
      expect(screen.getByText('QR Code')).toBeInTheDocument();
    });
  });

  it('should show logs dialog when clicking logs button', async () => {
    mockUseBotList.mockReturnValue({
      data: [mockBots[1]],
      isLoading: false,
      refetch: jest.fn(),
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logs: [] }),
    });

    renderWithQueryClient(<Bots />);
    
    const logsButton = screen.getByText('Logs');
    fireEvent.click(logsButton);

    await waitFor(() => {
      expect(screen.getByText('Logs do Bot')).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const mockRefetch = jest.fn();
    mockUseBotList.mockReturnValue({
      data: [mockBots[0]],
      isLoading: false,
      refetch: mockRefetch,
    });

    // Mock fetch error
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

    renderWithQueryClient(<Bots />);
    
    const startButton = screen.getByText('Iniciar');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});