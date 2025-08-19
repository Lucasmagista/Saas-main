
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '../utils/api';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger_type: 'event' | 'schedule' | 'manual';
  trigger_config: any;
  actions: AutomationAction[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AutomationAction {
  id: string;
  type: 'email' | 'sms' | 'webhook' | 'notification' | 'task';
  config: any;
  order: number;
}

export interface AutomationExecution {
  id: string;
  automation_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  trigger_data: any;
  result: any;
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

// Hooks para Automações
export const useAutomations = (filters?: any) => {
  return useQuery({
    queryKey: ['automations', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/workflows?${params}`);
      return response.data;
    }
  });
};

export const useCreateAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (automationData: Partial<Automation>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/workflows`, {
        method: 'POST',
        data: automationData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automação criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar automação');
    }
  });
};

export const useUpdateAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...automationData }: Partial<Automation> & { id: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/workflows/${id}`, {
        method: 'PUT',
        data: automationData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automação atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar automação');
    }
  });
};

export const useDeleteAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await makeAuthenticatedRequest(`${API_BASE}/api/automation/workflows/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automação removida com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover automação');
    }
  });
};

export const useToggleAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/workflows/${id}/toggle`, {
        method: 'POST',
        data: { is_active }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Status da automação alterado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao alterar status da automação');
    }
  });
};

// Hooks para Execuções
export const useAutomationExecutions = (automationId?: string) => {
  return useQuery({
    queryKey: ['automation-executions', automationId],
    queryFn: async () => {
      const params = automationId ? `?automation_id=${automationId}` : '';
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/executions${params}`);
      return response.data;
    }
  });
};

export const useRunAutomation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, trigger_data }: { id: string; trigger_data?: any }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/workflows/${id}/run`, {
        method: 'POST',
        data: { trigger_data }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-executions'] });
      toast.success('Automação executada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao executar automação');
    }
  });
};

// Hooks para Templates de Automação
export const useAutomationTemplates = () => {
  return useQuery({
    queryKey: ['automation-templates'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/templates`);
      return response.data;
    }
  });
};

export const useCreateFromTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ template_id, name, description }: { template_id: string; name: string; description?: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/templates/${template_id}/create`, {
        method: 'POST',
        data: { name, description }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automations'] });
      toast.success('Automação criada a partir do template!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar automação do template');
    }
  });
};

// Hooks para Analytics de Automação
export const useAutomationAnalytics = (timeRange = '30d') => {
  return useQuery({
    queryKey: ['automation-analytics', timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/automation/analytics?timeRange=${timeRange}`);
      return response.data;
    }
  });
};
