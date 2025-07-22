
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AutomationRule {
  id: string;
  organization_id: string;
  name: string;
  trigger_type: string;
  trigger_conditions: any;
  action_type: string;
  action_config: any;
  is_active: boolean;
  priority: number;
  usage_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Chatbot {
  id: string;
  organization_id: string;
  name: string;
  description: string;
  channel: string;
  config: any;
  knowledge_base: any;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useAutomationRules = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['automation-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .order('priority', { ascending: true });

      if (error) {
        toast({
          title: 'Erro ao carregar regras de automação',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as AutomationRule[];
    },
  });
};

export const useCreateAutomationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rule: Omit<AutomationRule, 'id' | 'created_at' | 'updated_at' | 'usage_count'>) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert(rule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({
        title: 'Regra criada',
        description: 'Regra de automação criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateAutomationRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AutomationRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('automation_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-rules'] });
      toast({
        title: 'Regra atualizada',
        description: 'Regra de automação atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar regra',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useChatbots = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['chatbots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chatbots')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar chatbots',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Chatbot[];
    },
  });
};

export const useCreateChatbot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (chatbot: Omit<Chatbot, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('chatbots')
        .insert(chatbot)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      toast({
        title: 'Chatbot criado',
        description: 'Chatbot criado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar chatbot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateChatbot = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Chatbot> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      toast({
        title: 'Chatbot atualizado',
        description: 'Chatbot atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar chatbot',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
