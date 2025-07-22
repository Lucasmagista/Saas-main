
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PushNotification {
  id: string;
  organization_id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  action_url: string;
  metadata: any;
  is_read: boolean;
  sent_at: string;
  read_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  organization_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: any;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('push_notifications')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) {
        toast({
          title: 'Erro ao carregar notificações',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as PushNotification[];
    },
  });
};

export const useNotificationPreferences = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        toast({
          title: 'Erro ao carregar preferências',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as NotificationPreference | null;
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreference>) => {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.user.id,
          organization_id: preferences.organization_id,
          ...preferences,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: 'Preferências atualizadas',
        description: 'Suas preferências de notificação foram atualizadas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar preferências',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('push_notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (notification: Omit<PushNotification, 'id' | 'sent_at' | 'read_at' | 'is_read'>) => {
      const { data, error } = await supabase
        .from('push_notifications')
        .insert(notification)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Notificação criada',
        description: 'Notificação enviada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar notificação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
