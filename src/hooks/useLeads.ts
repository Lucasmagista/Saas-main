
import { useState, useEffect, useCallback } from 'react';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score: number;
  assigned_to?: string;
  notes?: string;
  tags: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_contact_at?: string;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone: string;
  company?: string;
  position?: string;
  source: string;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score?: number;
  assigned_to?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateLeadData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: string;
  status?: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
  score?: number;
  assigned_to?: string;
  notes?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface LeadFilters {
  status?: string;
  source?: string;
  assigned_to?: string;
  tags?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({});

  // Polling para simular tempo real (em produção, usar WebSocket)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchLeads = useCallback(async (customFilters?: LeadFilters) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      const filtersToUse = customFilters || filters;
      
      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const url = `${API_BASE}/api/leads${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await makeAuthenticatedRequest(url);
      setLeads(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar leads');
      console.error('Erro ao buscar leads:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createLead = async (leadData: CreateLeadData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/leads`, {
        method: 'POST',
        data: leadData,
      });
      setLeads(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar lead';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateLead = async (id: string, leadData: UpdateLeadData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/leads/${id}`, {
        method: 'PUT',
        data: leadData,
      });
      setLeads(prev => prev.map(lead => lead.id === id ? response.data : lead));
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar lead';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteLead = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/leads/${id}`, {
        method: 'DELETE',
      });
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar lead';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const bulkUpdateLeads = async (ids: string[], updates: UpdateLeadData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/leads/bulk-update`, {
        method: 'PUT',
        data: { ids, updates },
      });
      
      // Atualizar leads localmente
      setLeads(prev => prev.map(lead => 
        ids.includes(lead.id) ? { ...lead, ...updates } : lead
      ));
      
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar leads em lote';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const bulkDeleteLeads = async (ids: string[]) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/leads/bulk-delete`, {
        method: 'DELETE',
        data: { ids },
      });
      setLeads(prev => prev.filter(lead => !ids.includes(lead.id)));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar leads em lote';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const importLeads = async (leadsData: CreateLeadData[]) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/leads/import`, {
        method: 'POST',
        data: { leads: leadsData },
      });
      
      // Adicionar novos leads à lista
      setLeads(prev => [...response.data, ...prev]);
      
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao importar leads';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const exportLeads = async (format: 'csv' | 'xlsx' = 'csv') => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/leads/export?format=${format}`, {
        method: 'GET',
        responseType: 'blob',
      });
      
      // Criar download do arquivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `leads.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao exportar leads';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateFilters = useCallback((newFilters: LeadFilters) => {
    setFilters(newFilters);
  }, []);

  // Iniciar polling para simular tempo real
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(() => {
      fetchLeads();
    }, 30000); // Poll a cada 30 segundos
    
    setPollingInterval(interval);
  }, [fetchLeads, pollingInterval]);

  // Parar polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  useEffect(() => {
    fetchLeads();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [fetchLeads, startPolling, stopPolling]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    leads,
    loading,
    error,
    filters,
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    bulkUpdateLeads,
    bulkDeleteLeads,
    importLeads,
    exportLeads,
    updateFilters,
    startPolling,
    stopPolling,
  };
};
