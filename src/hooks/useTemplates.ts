
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MessageTemplate {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  channel: string;
  language: string;
  subject: string;
  content: string;
  variables: any[];
  media_urls: string[];
  is_active: boolean;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useTemplates = (channel?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['templates', channel],
    queryFn: async () => {
      let query = supabase
        .from('message_templates_v2')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (channel) {
        query = query.eq('channel', channel);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Erro ao carregar templates',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as MessageTemplate[];
    },
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (template: Omit<MessageTemplate, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('message_templates_v2')
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template criado',
        description: 'Template criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<MessageTemplate> & { id: string }) => {
      const { data, error } = await supabase
        .from('message_templates_v2')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template atualizado',
        description: 'Template atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('message_templates_v2')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      toast({
        title: 'Template excluído',
        description: 'Template excluído com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir template',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
