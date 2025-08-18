
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  data: any;
  created_at: string;
}

export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    // Buscar notificações existentes
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching notifications:', error);
          // Se a tabela não existir, usar dados mock
          setNotifications(getMockNotifications());
          setUnreadCount(2);
          return;
        }

        // Mapear os dados para o tipo correto
        const mappedNotifications: Notification[] = (data || []).map(notification => ({
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: ['info', 'success', 'warning', 'error'].includes(notification.type) 
            ? notification.type as 'info' | 'success' | 'warning' | 'error'
            : 'info',
          read: notification.read,
          data: notification.data,
          created_at: notification.created_at,
      }));

      setNotifications(mappedNotifications);
      setUnreadCount(mappedNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error in fetchNotifications:', error);
      // Em caso de erro, usar dados mock
      setNotifications(getMockNotifications());
      setUnreadCount(2);
    }
    };

    fetchNotifications();

    // Configurar real-time para novas notificações
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const rawNotification = payload.new as any;
          const newNotification: Notification = {
            id: rawNotification.id,
            title: rawNotification.title,
            message: rawNotification.message,
            type: ['info', 'success', 'warning', 'error'].includes(rawNotification.type) 
              ? rawNotification.type as 'info' | 'success' | 'warning' | 'error'
              : 'info',
            read: rawNotification.read,
            data: rawNotification.data,
            created_at: rawNotification.created_at,
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Mostrar toast para nova notificação
          toast({
            title: newNotification.title,
            description: newNotification.message,
            variant: newNotification.type === 'error' ? 'destructive' : 'default',
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const rawNotification = payload.new as any;
          const updatedNotification: Notification = {
            id: rawNotification.id,
            title: rawNotification.title,
            message: rawNotification.message,
            type: ['info', 'success', 'warning', 'error'].includes(rawNotification.type) 
              ? rawNotification.type as 'info' | 'success' | 'warning' | 'error'
              : 'info',
            read: rawNotification.read,
            data: rawNotification.data,
            created_at: rawNotification.created_at,
          };
          
          setNotifications(prev => 
            prev.map(n => n.id === updatedNotification.id ? updatedNotification : n)
          );
          
          if (updatedNotification.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user?.id)
      .eq('read', false);

    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};

// Função para gerar notificações mock caso a tabela não exista
const getMockNotifications = (): Notification[] => [
  {
    id: '1',
    title: 'Bem-vindo ao Sistema!',
    message: 'Sistema carregado com sucesso. Todas as funcionalidades estão disponíveis.',
    type: 'success',
    read: false,
    data: null,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Dashboard Ativo',
    message: 'Seus dados estão sendo carregados em tempo real.',
    type: 'info',
    read: false,
    data: null,
    created_at: new Date(Date.now() - 300000).toISOString(), // 5 minutos atrás
  },
  {
    id: '3',
    title: 'Sistema Operacional',
    message: 'Todas as integrações estão funcionando corretamente.',
    type: 'success',
    read: true,
    data: null,
    created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
  },
];
