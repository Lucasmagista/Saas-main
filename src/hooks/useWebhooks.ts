import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '../utils/api';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDelivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'success' | 'failed';
  response_code?: number;
  response_body?: string;
  retry_count: number;
  created_at: string;
  sent_at?: string;
}

export interface CreateWebhookData {
  name: string;
  url: string;
  events: string[];
  is_active?: boolean;
  secret?: string;
}

export interface UpdateWebhookData {
  name?: string;
  url?: string;
  events?: string[];
  is_active?: boolean;
  secret?: string;
}

export interface WebhookStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  avg_duration: number;
  max_duration: number;
  min_duration: number;
}

// Queries
export const useWebhooks = (params?: {
  limit?: number;
  offset?: number;
  orderBy?: string;
  order?: 'asc' | 'desc';
}) => {
  const queryString = new URLSearchParams();
  if (params?.limit) queryString.append('limit', params.limit.toString());
  if (params?.offset) queryString.append('offset', params.offset.toString());
  if (params?.orderBy) queryString.append('orderBy', params.orderBy);
  if (params?.order) queryString.append('order', params.order);

  return useQuery({
    queryKey: ['webhooks', params],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/api/webhooks?${queryString.toString()}`
      );
      return response.data;
    },
    staleTime: 30000, // 30 segundos
  });
};

export const useWebhook = (id: string) => {
  return useQuery({
    queryKey: ['webhook', id],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/webhooks/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useWebhookDeliveries = (
  webhookId: string,
  params?: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
  }
) => {
  const queryString = new URLSearchParams();
  if (params?.limit) queryString.append('limit', params.limit.toString());
  if (params?.offset) queryString.append('offset', params.offset.toString());
  if (params?.orderBy) queryString.append('orderBy', params.orderBy);
  if (params?.order) queryString.append('order', params.order);

  return useQuery({
    queryKey: ['webhook-deliveries', webhookId, params],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/api/webhooks/${webhookId}/deliveries?${queryString.toString()}`
      );
      return response.data;
    },
    enabled: !!webhookId,
    staleTime: 10000, // 10 segundos
  });
};

export const useWebhookStats = (webhookId?: string, timeRange: '24h' | '7d' | '30d' = '24h') => {
  return useQuery({
    queryKey: ['webhook-stats', webhookId, timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(
        `${API_BASE}/api/webhooks/stats?timeRange=${timeRange}${webhookId ? `&webhookId=${webhookId}` : ''}`
      );
      return response.data as WebhookStats;
    },
    staleTime: 60000, // 1 minuto
  });
};

// Mutations
export const useCreateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWebhookData) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/webhooks`, {
        method: 'POST',
        data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook criado com sucesso');
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao criar webhook';
      toast.error(errorMsg);
    },
  });
};

export const useUpdateWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateWebhookData }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/webhooks/${id}`, {
        method: 'PUT',
        data,
      });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      queryClient.invalidateQueries({ queryKey: ['webhook', id] });
      toast.success('Webhook atualizado com sucesso');
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao atualizar webhook';
      toast.error(errorMsg);
    },
  });
};

export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/webhooks/${id}`, {
        method: 'DELETE',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Webhook removido com sucesso');
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao remover webhook';
      toast.error(errorMsg);
    },
  });
};

export const useTestWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, event, payload }: { id: string; event: string; payload?: Record<string, unknown> }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/webhooks/${id}/test`, {
        method: 'POST',
        data: { event, payload },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Teste de webhook realizado com sucesso');
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao testar webhook';
      toast.error(errorMsg);
    },
  });
};

export const useRegenerateWebhookSecret = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/webhooks/${id}/regenerate-secret`, {
        method: 'POST',
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      toast.success('Secret regenerado com sucesso');
      // Mostrar o novo secret em um modal ou toast
      console.log('Novo secret:', data.secret);
    },
    onError: (error) => {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao regenerar secret';
      toast.error(errorMsg);
    },
  });
};

// Hook combinado para gerenciar webhooks
export const useWebhookManagement = () => {
  const webhooks = useWebhooks();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();
  const regenerateSecret = useRegenerateWebhookSecret();

  return {
    // Data
    webhooks: webhooks.data || [],
    isLoading: webhooks.isLoading,
    isError: webhooks.isError,
    error: webhooks.error,
    
    // Actions
    createWebhook: createWebhook.mutate,
    updateWebhook: updateWebhook.mutate,
    deleteWebhook: deleteWebhook.mutate,
    testWebhook: testWebhook.mutate,
    regenerateSecret: regenerateSecret.mutate,
    
    // Loading states
    isCreating: createWebhook.isPending,
    isUpdating: updateWebhook.isPending,
    isDeleting: deleteWebhook.isPending,
    isTesting: testWebhook.isPending,
    isRegenerating: regenerateSecret.isPending,
    
    // Refetch
    refetch: webhooks.refetch,
  };
};

// Hook para webhook específico
export const useWebhookDetail = (id: string) => {
  const webhook = useWebhook(id);
  const deliveries = useWebhookDeliveries(id);
  const stats = useWebhookStats(id);
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();
  const regenerateSecret = useRegenerateWebhookSecret();

  return {
    // Data
    webhook: webhook.data,
    deliveries: deliveries.data || [],
    stats: stats.data,
    
    // Loading states
    isLoading: webhook.isLoading,
    isDeliveriesLoading: deliveries.isLoading,
    isStatsLoading: stats.isLoading,
    isError: webhook.isError,
    
    // Actions
    updateWebhook: updateWebhook.mutate,
    deleteWebhook: deleteWebhook.mutate,
    testWebhook: testWebhook.mutate,
    regenerateSecret: regenerateSecret.mutate,
    
    // Action loading states
    isUpdating: updateWebhook.isPending,
    isDeleting: deleteWebhook.isPending,
    isTesting: testWebhook.isPending,
    isRegenerating: regenerateSecret.isPending,
    
    // Refetch
    refetch: webhook.refetch,
    refetchDeliveries: deliveries.refetch,
    refetchStats: stats.refetch,
  };
};