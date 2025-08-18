
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExternalIntegration {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  config: any;
  credentials: any;
  is_active: boolean;
  last_sync: string;
  sync_status: string;
  error_message: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WebhookEvent {
  id: string;
  organization_id: string;
  webhook_id: string;
  event_type: string;
  payload: any;
  status: string;
  attempts: number;
  last_attempt: string;
  response_status: number;
  response_body: string;
  created_at: string;
}

export const useIntegrations = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar integrações',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as ExternalIntegration[];
    },
  });
};

export const useCreateIntegration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (integration: Omit<ExternalIntegration, 'id' | 'created_at' | 'updated_at' | 'last_sync' | 'sync_status' | 'error_message'>) => {
      const { data, error } = await supabase
        .from('external_integrations')
        .insert(integration)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: 'Integração criada',
        description: 'Integração criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar integração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExternalIntegration> & { id: string }) => {
      const { data, error } = await supabase
        .from('external_integrations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: 'Integração atualizada',
        description: 'Integração atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar integração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useWebhookEvents = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['webhook-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        toast({
          title: 'Erro ao carregar eventos webhook',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as WebhookEvent[];
    },
  });
};

export const useSyncIntegration = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (integrationId: string) => {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data, error } = await supabase
        .from('external_integrations')
        .update({
          last_sync: new Date().toISOString(),
          sync_status: 'completed',
          error_message: null,
        })
        .eq('id', integrationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast({
        title: 'Sincronização completa',
        description: 'Dados sincronizados com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro na sincronização',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
