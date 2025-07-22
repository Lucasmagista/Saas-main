
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
  config: any;
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
      // Simular geração de QR Code
      const qrCode = `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
          <rect width="200" height="200" fill="white"/>
          <text x="100" y="100" text-anchor="middle" font-size="14" fill="black">QR Code</text>
          <text x="100" y="120" text-anchor="middle" font-size="12" fill="gray">Sessão: ${sessionId}</text>
        </svg>
      `)}`;

      const { data, error } = await supabase
        .from('external_integrations')
        .update({
          config: {
            qr_code: qrCode,
          },
          sync_status: 'pending',
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, qr_code: qrCode };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-sessions'] });
      toast({
        title: 'QR Code gerado',
        description: 'Escaneie o QR Code com seu WhatsApp.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao gerar QR Code',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
