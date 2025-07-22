
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useConversations } from './useConversations';
import { useToast } from '@/hooks/use-toast';

export const useRealTimeConversations = () => {
  const { refetch } = useConversations();
  const { toast } = useToast();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Configurar realtime para conversas
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        console.log('Nova conversa:', payload.new);
        refetch();
        toast({
          title: 'Nova conversa',
          description: 'Uma nova conversa foi iniciada.',
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations'
      }, (payload) => {
        console.log('Conversa atualizada:', payload.new);
        refetch();
      })
      .subscribe();

    // Configurar realtime para mensagens
    const messagesChannel = supabase
      .channel('messages-changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        console.log('Nova mensagem:', payload.new);
        refetch();
        
        // Notificar sobre nova mensagem se não for do agente atual
        if (payload.new.sender_type !== 'agent') {
          toast({
            title: 'Nova mensagem',
            description: 'Você recebeu uma nova mensagem.',
          });
        }
      })
      .subscribe();

    // Configurar presença para usuários online
    const presenceChannel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users: Record<string, boolean> = {};
        
        Object.keys(state).forEach(userId => {
          users[userId] = true;
        });
        
        setOnlineUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        setOnlineUsers(prev => ({ ...prev, [key]: true }));
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        setOnlineUsers(prev => ({ ...prev, [key]: false }));
      })
      .subscribe();

    // Rastrear presença do usuário atual
    const trackPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
      }
    };

    trackPresence();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [refetch, toast]);

  return { onlineUsers };
};
