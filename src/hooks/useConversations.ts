
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  organization_id: string;
  lead_id: string;
  channel: string;
  status: string;
  assigned_agent: string;
  tags: string[];
  metadata: any;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  lead?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'agent' | 'bot';
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'document' | 'audio' | 'video';
  metadata: any;
  created_at: string;
  is_read: boolean;
}

export const useConversations = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          lead:leads(name, email, phone)
        `)
        .order('last_message_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar conversas',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Conversation[];
    },
  });
};

export const useMessages = (conversationId: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        toast({
          title: 'Erro ao carregar mensagens',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Message[];
    },
    enabled: !!conversationId,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (message: {
      conversation_id: string;
      content: string;
      sender_type: 'user' | 'agent' | 'bot';
      sender_id: string;
      message_type?: string;
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;

      // Atualizar last_message_at da conversa
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', message.conversation_id);

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Mensagem enviada',
        description: 'Sua mensagem foi enviada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (conversation: {
      organization_id: string;
      lead_id: string;
      channel: string;
      assigned_agent?: string;
      tags?: string[];
      metadata?: any;
    }) => {
      const { data, error } = await supabase
        .from('conversations')
        .insert(conversation)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Conversa criada',
        description: 'Nova conversa criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar conversa',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
