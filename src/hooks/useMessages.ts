import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '../utils/api';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Message {
  id: string;
  bot_id: string;
  to_number?: string;
  content: string;
  type: 'text' | 'media' | 'template';
  metadata?: any;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  sent_at?: string;
  delivered_at?: string;
  error_message?: string;
  retry_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMessageData {
  bot_id: string;
  content: string;
  type?: 'text' | 'media' | 'template';
  metadata?: any;
}

export interface SendMessageData {
  to: string;
  content: string;
  type?: 'text' | 'media' | 'template';
  metadata?: any;
}

export interface BatchMessageData {
  messages: SendMessageData[];
}

export interface MessageFilters {
  bot_id?: string;
  type?: 'text' | 'media' | 'template';
  status?: 'pending' | 'sent' | 'failed' | 'delivered';
  startDate?: string;
  endDate?: string;
}

export interface MessageStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  delivered: number;
  text_messages: number;
  media_messages: number;
  template_messages: number;
}

// Queries
export const useMessages = (params?: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
  filters?: MessageFilters;
}) => {
  const queryString = new URLSearchParams();
  if (params?.limit) queryString.append('limit', params.limit.toString());
  if (params?.offset) queryString.append('offset', params.offset.toString());
  if (params?.orderBy) queryString.append('orderBy', params.orderBy);
  if (params?.order) queryString.append('order', params.order);
  
  // Adicionar filtros
  if (params?.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value) queryString.append(key, value.toString());
    });
  }

  return useQuery({
    queryKey: ['messages', params],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/api/messages?${queryString.toString()}`
      );
      return response.data;
    },
    staleTime: 15000, // 15 segundos
  });
};

export const useMessage = (id: string) => {
  return useQuery({
    queryKey: ['message', id],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/messages/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useMessageStats = () => {
  return useQuery({
    queryKey: ['message-stats'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/messages/stats/overview`);
      return response.data as MessageStats;
    },
    staleTime: 30000, // 30 segundos
  });
};

// Mutations
export const useCreateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMessageData) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/messages`, {
        method: 'POST',
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
      toast.success('Mensagem criada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar mensagem');
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendMessageData) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/messages/send`, {
        method: 'POST',
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
      toast.success('Mensagem enviada com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao enviar mensagem');
    },
  });
};

export const useSendBatchMessages = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: BatchMessageData) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/messages/batch`, {
        method: 'POST',
        data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
      toast.success(`${data.total} mensagens enviadas com sucesso`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao enviar mensagens em lote');
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/messages/${id}`, {
        method: 'DELETE',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message-stats'] });
      toast.success('Mensagem removida com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover mensagem');
    },
  });
};

// Hook combinado para gerenciar mensagens
export const useMessageManagement = () => {
  const messages = useMessages();
  const stats = useMessageStats();
  const createMessage = useCreateMessage();
  const sendMessage = useSendMessage();
  const sendBatchMessages = useSendBatchMessages();
  const deleteMessage = useDeleteMessage();

  return {
    // Data
    messages: messages.data || [],
    stats: stats.data,
    isLoading: messages.isLoading,
    isStatsLoading: stats.isLoading,
    isError: messages.isError,
    statsError: stats.error,
    
    // Actions
    createMessage: createMessage.mutate,
    sendMessage: sendMessage.mutate,
    sendBatchMessages: sendBatchMessages.mutate,
    deleteMessage: deleteMessage.mutate,
    
    // Loading states
    isCreating: createMessage.isPending,
    isSending: sendMessage.isPending,
    isSendingBatch: sendBatchMessages.isPending,
    isDeleting: deleteMessage.isPending,
    
    // Refetch
    refetch: messages.refetch,
    refetchStats: stats.refetch,
  };
};

// Hook para mensagem específica
export const useMessageDetail = (id: string) => {
  const message = useMessage(id);
  const deleteMessage = useDeleteMessage();

  return {
    // Data
    message: message.data,
    
    // Loading states
    isLoading: message.isLoading,
    isError: message.isError,
    
    // Actions
    deleteMessage: deleteMessage.mutate,
    
    // Action loading states
    isDeleting: deleteMessage.isPending,
    
    // Refetch
    refetch: message.refetch,
  };
};

// Hook para filtros de mensagens
export const useMessageFilters = () => {
  const [filters, setFilters] = React.useState<MessageFilters>({});
  const [pagination, setPagination] = React.useState({
    limit: 20,
    offset: 0,
    orderBy: 'created_at',
    order: 'desc' as 'asc' | 'desc'
  });

  const messages = useMessages({
    ...pagination,
    filters
  });

  const updateFilters = (newFilters: Partial<MessageFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, offset: 0 })); // Reset paginação
  };

  const updatePagination = (newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  };

  const clearFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  return {
    // Data
    messages: messages.data || [],
    isLoading: messages.isLoading,
    isError: messages.isError,
    
    // Filters and pagination
    filters,
    pagination,
    updateFilters,
    updatePagination,
    clearFilters,
    
    // Refetch
    refetch: messages.refetch,
  };
};

// Hook para estatísticas em tempo real
export const useMessageStatsRealtime = (interval = 30000) => {
  const stats = useMessageStats();

  React.useEffect(() => {
    const intervalId = setInterval(() => {
      stats.refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [interval, stats.refetch]);

  return stats;
};