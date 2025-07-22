
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SalesStage {
  id: string;
  organization_id: string;
  pipeline_id: string;
  name: string;
  description: string;
  position: number;
  probability: number;
  is_active: boolean;
  created_at: string;
}

export interface Interaction {
  id: string;
  organization_id: string;
  lead_id: string;
  opportunity_id: string;
  user_id: string;
  type: string;
  subject: string;
  content: string;
  duration: number;
  outcome: string;
  next_action: string;
  scheduled_at: string;
  completed_at: string;
  metadata: any;
  created_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  tags: string[];
  custom_fields: any;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  organization_id: string;
  pipeline_id: string;
  lead_id: string;
  title: string;
  description: string;
  value: number;
  stage: string;
  probability: number;
  expected_close_date: string;
  assigned_to: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useSalesStages = (pipelineId?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['sales-stages', pipelineId],
    queryFn: async () => {
      let query = supabase
        .from('sales_stages')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });

      if (pipelineId) {
        query = query.eq('pipeline_id', pipelineId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Erro ao carregar estágios',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as SalesStage[];
    },
  });
};

export const useInteractions = (leadId?: string, opportunityId?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['interactions', leadId, opportunityId],
    queryFn: async () => {
      let query = supabase
        .from('interactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      if (opportunityId) {
        query = query.eq('opportunity_id', opportunityId);
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: 'Erro ao carregar interações',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as Interaction[];
    },
  });
};

export const useCreateInteraction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (interaction: Omit<Interaction, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('interactions')
        .insert(interaction)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      toast({
        title: 'Interação registrada',
        description: 'Interação registrada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar interação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Lead> & { id: string }) => {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: 'Lead atualizado',
        description: 'Lead atualizado com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar lead',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('opportunities')
        .insert(opportunity)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: 'Oportunidade criada',
        description: 'Oportunidade criada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar oportunidade',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Opportunity> & { id: string }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: 'Oportunidade atualizada',
        description: 'Oportunidade atualizada com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar oportunidade',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useOpportunities = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          lead:leads(name, email, phone, company)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: 'Erro ao carregar oportunidades',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as (Opportunity & { lead: Lead })[];
    },
  });
};

export const useConversionMetrics = () => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['conversion-metrics'],
    queryFn: async () => {
      // Buscar métricas de conversão
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (leadsError) {
        toast({
          title: 'Erro ao carregar métricas',
          description: leadsError.message,
          variant: 'destructive',
        });
        throw leadsError;
      }

      const { data: opportunities, error: oppsError } = await supabase
        .from('opportunities')
        .select('stage, value, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (oppsError) {
        toast({
          title: 'Erro ao carregar oportunidades',
          description: oppsError.message,
          variant: 'destructive',
        });
        throw oppsError;
      }

      // Calcular métricas
      const totalLeads = leads.length;
      const qualifiedLeads = leads.filter(lead => lead.status === 'qualified').length;
      const closedOpportunities = opportunities.filter(opp => opp.stage === 'Fechado').length;
      const totalValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);

      return {
        totalLeads,
        qualifiedLeads,
        closedOpportunities,
        totalValue,
        conversionRate: totalLeads > 0 ? (qualifiedLeads / totalLeads) * 100 : 0,
        closeRate: opportunities.length > 0 ? (closedOpportunities / opportunities.length) * 100 : 0,
      };
    },
  });
};
