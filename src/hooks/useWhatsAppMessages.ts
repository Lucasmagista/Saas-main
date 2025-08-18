import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { sendMessageApi, getMessagesApi, Message } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import type { SocketIOClient } from '@/types/socket';

// Singleton para gerenciar uma única conexão WebSocket
class WebSocketManager {
  private static instance: WebSocketManager;
  private socket: SocketIOClient | null = null;
  private isConnecting = false;
  private isConnected = false;
  private readonly listeners: Set<(socket: SocketIOClient | null, isConnected: boolean) => void> = new Set();
  
  static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }
  
  addListener(callback: (socket: SocketIOClient | null, isConnected: boolean) => void) {
    this.listeners.add(callback);
    // Notifica imediatamente o estado atual
    callback(this.socket, this.isConnected);
  }
  
  removeListener(callback: (socket: SocketIOClient | null, isConnected: boolean) => void) {
    this.listeners.delete(callback);
  }
  
  private notifyListeners(isConnected: boolean) {
    this.isConnected = isConnected;
    this.listeners.forEach(callback => callback(this.socket, isConnected));
  }
  
  async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      console.log('WebSocketManager: Já conectado ou conectando');
      return;
    }
    
    if (typeof window === 'undefined' || !window.io) {
      console.warn('WebSocketManager: Socket.io não disponível');
      return;
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('WebSocketManager: Token não encontrado');
      return;
    }
    
    console.log('WebSocketManager: Iniciando nova conexão');
    this.isConnecting = true;
    
    try {
      // Desconecta socket anterior se existir
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      
      this.socket = window.io(`${window.location.protocol}//${window.location.hostname}:3002`, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 5000,
        forceNew: true,
      });
      
      this.socket.on('connect', () => {
        console.log(`WebSocketManager: Conectado com ID ${this.socket?.id}`);
        this.isConnecting = false;
        this.notifyListeners(true);
      });
      
      this.socket.on('disconnect', (reason: string) => {
        console.log(`WebSocketManager: Desconectado - ${reason}`);
        this.notifyListeners(false);
      });
      
      this.socket.on('connect_error', (error: Error) => {
        console.error('WebSocketManager: Erro de conexão:', error.message);
        this.isConnecting = false;
        this.notifyListeners(false);
      });
      
    } catch (error) {
      console.error('WebSocketManager: Erro ao criar socket:', error);
      this.isConnecting = false;
      this.notifyListeners(false);
    }
  }
  
  disconnect() {
    console.log('WebSocketManager: Desconectando');
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.notifyListeners(false);
  }
  
  getSocket(): SocketIOClient | null {
    return this.socket;
  }
  
  getIsConnected(): boolean {
    return this.isConnected;
  }
}

interface WhatsAppMessage extends Message {
  conversation_id?: string;
  sender_type: 'user' | 'agent' | 'bot';
  sender_id?: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  is_read?: boolean;
}

interface WhatsAppMessageFilters {
  number?: string;
  date?: string;
  conversation_id?: string;
}

/**
 * Hook otimizado para WhatsApp com controle robusto de WebSocket
 * Usa um gerenciador singleton para evitar múltiplas conexões
 */
export const useWhatsAppMessages = (conversationId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados principais
  const [socket, setSocket] = useState<SocketIOClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [filters, setFilters] = useState<WhatsAppMessageFilters>({});
  const [page, setPage] = useState(1);

  // Refs para controle
  const mountedRef = useRef(true);
  const wsManager = useRef(WebSocketManager.getInstance());

  // Query para mensagens
  const {
    data: messagesData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['whatsapp-messages', conversationId, filters, page],
    queryFn: async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.warn('WhatsApp Messages: Token não encontrado, pulando query');
        return { data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } };
      }
      
      const apiFilters = { ...filters };
      if (conversationId) {
        apiFilters.conversation_id = conversationId;
      }
      
      console.log('WhatsApp Messages: Fazendo requisição para API', { page, filters: apiFilters });
      return await getMessagesApi(page, 50, apiFilters);
    },
    enabled: !!localStorage.getItem('accessToken'),
    retry: (failureCount, error: Error) => {
      // Não retry se for erro de autenticação
      if (error?.message?.includes('Token') || error?.message?.includes('401')) {
        console.warn('WhatsApp Messages: Erro de autenticação, parando tentativas');
        return false;
      }
      return failureCount < 3;
    },
  });

  // Callback para mudanças na conexão
  const handleConnectionChange = useCallback((newSocket: SocketIOClient | null, connected: boolean) => {
    if (!mountedRef.current) return;
    
    setSocket(newSocket);
    setIsConnected(connected);
    
    // Configura listeners para mensagens se conectado
    if (newSocket && connected) {
      newSocket.on('message', (msg: WhatsAppMessage) => {
        if (!mountedRef.current) return;
        
        console.log('Nova mensagem WhatsApp recebida via WebSocket:', msg);
        queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
        
        if (msg.sender_type !== 'agent') {
          toast({
            title: 'Nova mensagem WhatsApp',
            description: `Mensagem de ${msg.number || 'número desconhecido'}`,
          });
        }
      });
    }
  }, [toast, queryClient]);

  // Effect para gerenciar conexão WebSocket
  useEffect(() => {
    const manager = wsManager.current;
    
    // Registra listener para mudanças de estado
    manager.addListener(handleConnectionChange);
    
    // Inicia conexão se não estiver conectado
    if (!manager.getIsConnected()) {
      manager.connect().catch(error => {
        console.error('Erro ao conectar WebSocket:', error);
      });
    }

    return () => {
      mountedRef.current = false;
      manager.removeListener(handleConnectionChange);
    };
  }, [handleConnectionChange]);

  // Mutation para enviar mensagens
  const sendMessage = useMutation({
    mutationFn: async ({ number, message }: { number: string; message: string }) => {
      console.log('WhatsApp Messages: Enviando mensagem via API', { number, message });
      return await sendMessageApi(number, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      toast({
        title: 'Mensagem enviada',
        description: 'Mensagem enviada via WhatsApp com sucesso.',
      });
    },
    onError: (error: Error) => {
      console.error('WhatsApp Messages: Erro ao enviar mensagem:', error);
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Carregar mais mensagens
  const loadMoreMessages = useCallback(async () => {
    if (messagesData?.pagination.page < messagesData.pagination.totalPages) {
      console.log('WhatsApp Messages: Carregando próxima página');
      setPage(prev => prev + 1);
    }
  }, [messagesData]);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: WhatsAppMessageFilters) => {
    console.log('WhatsApp Messages: Aplicando filtros', newFilters);
    setFilters(newFilters);
    setPage(1);
  }, []);

  // Limpar filtros
  const clearFilters = useCallback(() => {
    console.log('WhatsApp Messages: Limpando filtros');
    setFilters({});
    setPage(1);
  }, []);

  // Forçar reconexão
  const forceReconnect = useCallback(() => {
    console.log('WhatsApp Messages: Forçando reconexão');
    const manager = wsManager.current;
    manager.disconnect();
    setTimeout(() => {
      manager.connect().catch(error => {
        console.error('Erro ao reconectar WebSocket:', error);
      });
    }, 1000);
  }, []);

  // Conectar WebSocket manualmente
  const connectWebSocket = useCallback(() => {
    console.log('WhatsApp Messages: Conectando WebSocket manualmente');
    wsManager.current.connect().catch(error => {
      console.error('Erro ao conectar WebSocket manualmente:', error);
    });
  }, []);

  // Desconectar WebSocket
  const disconnectWebSocket = useCallback(() => {
    console.log('WhatsApp Messages: Desconectando WebSocket manualmente');
    wsManager.current.disconnect();
  }, []);

  return {
    // Dados
    messages: messagesData?.data || [],
    pagination: messagesData?.pagination,
    isLoading,
    error,
    
    // Estado da conexão
    isConnected,
    isReconnecting: false, // Sempre false pois o manager cuida disso
    reconnectAttempts: 0, // Sempre 0 pois o manager cuida disso
    socket,
    
    // Ações
    sendMessage,
    loadMoreMessages,
    applyFilters,
    clearFilters,
    refetch,
    connectWebSocket,
    disconnectWebSocket,
    forceReconnect,
    
    // Filtros e paginação
    filters,
    page,
    hasMore: messagesData ? messagesData.pagination.page < messagesData.pagination.totalPages : false,
  };
};

/**
 * Hook simplificado para apenas envio de mensagens
 */
export const useWhatsAppSendMessage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ number, message }: { number: string; message: string }) => {
      return await sendMessageApi(number, message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-messages'] });
      toast({
        title: 'Mensagem enviada',
        description: 'Mensagem enviada via WhatsApp.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
