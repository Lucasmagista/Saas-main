
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: string | null;
  status: string;
  tags: string[];
  custom_fields: any;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching leads:', error);
          return;
        }

        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    // Real-time subscription
    const channel = supabase
      .channel('leads')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          setLeads(prev => [payload.new as Lead, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          setLeads(prev =>
            prev.map(lead => lead.id === payload.new.id ? payload.new as Lead : lead)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'leads'
        },
        (payload) => {
          setLeads(prev => prev.filter(lead => lead.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const createLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single();

      if (error) {
        toast({
          title: 'Erro ao criar lead',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Sucesso!',
        description: 'Lead criado com sucesso',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error creating lead:', error);
      return { error };
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Erro ao atualizar lead',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Sucesso!',
        description: 'Lead atualizado com sucesso',
      });

      return { data, error: null };
    } catch (error) {
      console.error('Error updating lead:', error);
      return { error };
    }
  };

  const deleteLead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) {
        toast({
          title: 'Erro ao deletar lead',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: 'Sucesso!',
        description: 'Lead deletado com sucesso',
      });

      return { error: null };
    } catch (error) {
      console.error('Error deleting lead:', error);
      return { error };
    }
  };

  return {
    leads,
    loading,
    createLead,
    updateLead,
    deleteLead,
  };
};
