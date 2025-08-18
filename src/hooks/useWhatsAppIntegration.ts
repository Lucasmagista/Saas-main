
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WhatsAppSession {
  id: string;
  name: string;
  phone_number: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qr_code?: string;
  last_activity: string;
  organization_id: string;
  config: WhatsAppConfig;
  created_at: string;
  updated_at: string;
}

interface WhatsAppConfig {
  phone_number?: string;
  qr_code?: string;
}

export const useWhatsAppSessions = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['whatsapp-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('external_integrations')
        .select('*')
        .eq('type', 'whatsapp')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar sessões WhatsApp',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data.map(session => {
        const config = session.config as WhatsAppConfig;
        return {
          id: session.id,
          name: session.name,
          phone_number: config?.phone_number || '',
          status: session.sync_status === 'completed' ? 'connected' : 'disconnected',
          qr_code: config?.qr_code,
          last_activity: session.last_sync || session.updated_at,
          organization_id: session.organization_id,
          config: session.config,
          created_at: session.created_at,
          updated_at: session.updated_at,
        };
      }) as WhatsAppSession[];
    },
  });
};

export const useCreateWhatsAppSession = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (session: { name: string; phone_number: string }) => {
      const { data, error } = await supabase
        .from('external_integrations')
        .insert({
          name: session.name,
          type: 'whatsapp',
          config: {
            phone_number: session.phone_number,
            qr_code: null,
          },
          is_active: true,
          sync_status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-sessions'] });
      toast({
        title: 'Sessão WhatsApp criada',
        description: 'Sessão criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar sessão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useGenerateQRCode = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      // Chama a API real do backend para gerar QR Code
      const response = await fetch(`/api/whatsapp/sessions/${sessionId}/qrcode`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar QR Code');
      }

      const data = await response.json();
      
      if (!data.qr_code) {
        throw new Error('QR Code não disponível no momento');
      }

      // Atualiza a sessão no banco com o QR Code real
      const { data: updatedSession, error } = await supabase
        .from('external_integrations')
        .update({
          config: {
            qr_code: data.qr_code,
          },
          sync_status: 'pending',
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return { ...updatedSession, qr_code: data.qr_code };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-sessions'] });
      toast({
        title: 'QR Code gerado',
        description: 'Escaneie o QR Code com seu WhatsApp para conectar.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao gerar QR Code',
        description: error.message || 'Falha na geração do QR Code',
        variant: 'destructive',
      });
    },
  });
};
