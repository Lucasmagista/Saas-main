
import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Integration {
  id: string;
  name: string;
  type: 'webhook' | 'api' | 'database' | 'email' | 'sms' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'custom';
  provider: string;
  config: Record<string, any>;
  is_active: boolean;
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  last_sync?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  metadata?: any;
}

export interface CreateIntegrationData {
  name: string;
  type: 'webhook' | 'api' | 'database' | 'email' | 'sms' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'custom';
  provider: string;
  config: Record<string, any>;
  is_active?: boolean;
  metadata?: any;
}

export interface UpdateIntegrationData {
  name?: string;
  type?: 'webhook' | 'api' | 'database' | 'email' | 'sms' | 'whatsapp' | 'slack' | 'discord' | 'telegram' | 'custom';
  provider?: string;
  config?: Record<string, any>;
  is_active?: boolean;
  metadata?: any;
}

export interface IntegrationFilters {
  type?: string;
  provider?: string;
  status?: string;
  is_active?: boolean;
  search?: string;
}

export const useIntegrations = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IntegrationFilters>({});

  const fetchIntegrations = async (customFilters?: IntegrationFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      const filtersToUse = customFilters || filters;
      
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const url = `${API_BASE}/api/integrations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await makeAuthenticatedRequest(url);
      setIntegrations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar integrações');
      console.error('Erro ao buscar integrações:', err);
    } finally {
      setLoading(false);
    }
  };

  const createIntegration = async (integrationData: CreateIntegrationData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations`, {
        method: 'POST',
        data: integrationData,
      });
      setIntegrations(prev => [response.data, ...prev]);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateIntegration = async (id: string, integrationData: UpdateIntegrationData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations/${id}`, {
        method: 'PUT',
        data: integrationData,
      });
      setIntegrations(prev => prev.map(integration => integration.id === id ? response.data : integration));
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteIntegration = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/integrations/${id}`, {
        method: 'DELETE',
      });
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const testIntegration = async (id: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations/${id}/test`, {
        method: 'POST',
      });
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao testar integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const syncIntegration = async (id: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations/${id}/sync`, {
        method: 'POST',
      });
      
      // Atualizar última sincronização
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, last_sync: new Date().toISOString(), status: response.data.status }
          : integration
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao sincronizar integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const enableIntegration = async (id: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations/${id}/enable`, {
        method: 'PUT',
      });
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, is_active: true, status: response.data.status }
          : integration
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao habilitar integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const disableIntegration = async (id: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations/${id}/disable`, {
        method: 'PUT',
      });
      
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, is_active: false, status: response.data.status }
          : integration
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao desabilitar integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getIntegrationLogs = async (id: string, limit: number = 50) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations/${id}/logs?limit=${limit}`);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao carregar logs da integração';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const bulkUpdateIntegrations = async (ids: string[], updates: UpdateIntegrationData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/integrations/bulk-update`, {
        method: 'PUT',
        data: { ids, updates },
      });
      
      // Atualizar integrações localmente
      setIntegrations(prev => prev.map(integration => 
        ids.includes(integration.id) ? { ...integration, ...updates } : integration
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar integrações em lote';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const bulkDeleteIntegrations = async (ids: string[]) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/integrations/bulk-delete`, {
        method: 'DELETE',
        data: { ids },
      });
      setIntegrations(prev => prev.filter(integration => !ids.includes(integration.id)));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar integrações em lote';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateFilters = (newFilters: IntegrationFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    fetchIntegrations();
  }, [filters]);

  return {
    integrations,
    loading,
    error,
    filters,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
    syncIntegration,
    enableIntegration,
    disableIntegration,
    getIntegrationLogs,
    bulkUpdateIntegrations,
    bulkDeleteIntegrations,
    updateFilters,
  };
};
