
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Bot {
  id: string;
  name: string;
  channel: string;
  is_active: boolean;
  config: any;
  created_at: string;
  updated_at: string;
  organization_id: string;
  description?: string;
  knowledge_base?: any;
  created_by?: string;
}

export const useBots = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['bots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar bots',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Bot[];
    },
  });
};

export const useCreateBot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bot: Omit<Bot, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('chatbots')
        .insert(bot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast({
        title: 'Bot criado',
        description: 'Bot criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar bot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateBot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Bot> & { id: string }) => {
      const { data, error } = await supabase
        .from('chatbots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bots'] });
      toast({
        title: 'Bot atualizado',
        description: 'Bot atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar bot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
