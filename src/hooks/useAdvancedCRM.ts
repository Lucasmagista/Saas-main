
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '../utils/api';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  source: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  notes: string;
  value: number;
  probability: number;
}

export interface Opportunity {
  id: string;
  lead_id: string;
  title: string;
  description: string;
  value: number;
  probability: number;
  stage: 'discovery' | 'proposal' | 'negotiation' | 'closed' | 'lost';
  expected_close_date: string;
  assigned_to: string;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  lead_id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  is_primary: boolean;
  created_at: string;
}

// Hooks para Leads
export const useLeads = (filters?: any) => {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/leads?${params}`);
      return response.data;
    }
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (leadData: Partial<Lead>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/leads`, {
        method: 'POST',
        data: leadData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar lead');
    }
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...leadData }: Partial<Lead> & { id: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/leads/${id}`, {
        method: 'PUT',
        data: leadData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar lead');
    }
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await makeAuthenticatedRequest(`${API_BASE}/api/crm/leads/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover lead');
    }
  });
};

// Hooks para Opportunities
export const useOpportunities = (filters?: any) => {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/opportunities?${params}`);
      return response.data;
    }
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (opportunityData: Partial<Opportunity>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/opportunities`, {
        method: 'POST',
        data: opportunityData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Oportunidade criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar oportunidade');
    }
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...opportunityData }: Partial<Opportunity> & { id: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/opportunities/${id}`, {
        method: 'PUT',
        data: opportunityData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Oportunidade atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar oportunidade');
    }
  });
};

// Hooks para Contacts
export const useContacts = (leadId?: string) => {
  return useQuery({
    queryKey: ['contacts', leadId],
    queryFn: async () => {
      const params = leadId ? `?lead_id=${leadId}` : '';
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/contacts${params}`);
      return response.data;
    },
    enabled: !!leadId
  });
};

export const useCreateContact = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (contactData: Partial<Contact>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/contacts`, {
        method: 'POST',
        data: contactData
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contacts', variables.lead_id] });
      toast.success('Contato criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar contato');
    }
  });
};

// Hooks para Analytics
export const useCRMAnalytics = (timeRange = '30d') => {
  return useQuery({
    queryKey: ['crm-analytics', timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/analytics?timeRange=${timeRange}`);
      return response.data;
    }
  });
};

export const useSalesPipeline = () => {
  return useQuery({
    queryKey: ['sales-pipeline'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/pipeline`);
      return response.data;
    }
  });
};

export const useLeadScoring = () => {
  return useQuery({
    queryKey: ['lead-scoring'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/crm/lead-scoring`);
      return response.data;
    }
  });
};
