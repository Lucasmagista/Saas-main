
import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Template {
  id: string;
  name: string;
  description?: string;
  content: string;
  type: 'text' | 'media' | 'template';
  variables: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  content: string;
  type?: 'text' | 'media' | 'template';
  variables?: string[];
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  content?: string;
  type?: 'text' | 'media' | 'template';
  variables?: string[];
  is_active?: boolean;
  metadata?: Record<string, unknown>;
}

export interface TemplateFilters {
  type?: string;
  is_active?: boolean;
  search?: string;
  created_by?: string;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TemplateFilters>({});

  const fetchTemplates = async (customFilters?: TemplateFilters) => {
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

      const url = `${API_BASE}/api/templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await makeAuthenticatedRequest(url);
      setTemplates(response.data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar templates';
      setError(errorMsg);
      console.error('Erro ao buscar templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: CreateTemplateData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/templates`, {
        method: 'POST',
        data: templateData,
      });
      setTemplates(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateTemplate = async (id: string, templateData: UpdateTemplateData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/templates/${id}`, {
        method: 'PUT',
        data: templateData,
      });
      setTemplates(prev => prev.map(template => template.id === id ? response.data : template));
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/templates/${id}`, {
        method: 'DELETE',
      });
      setTemplates(prev => prev.filter(template => template.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const duplicateTemplate = async (id: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/templates/${id}/duplicate`, {
        method: 'POST',
      });
      setTemplates(prev => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao duplicar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const renderTemplate = async (id: string, variables: Record<string, string | number | boolean>) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/templates/${id}/render`, {
        method: 'POST',
        data: { variables },
      });
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao renderizar template';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const bulkUpdateTemplates = async (ids: string[], updates: UpdateTemplateData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/templates/bulk-update`, {
        method: 'PUT',
        data: { ids, updates },
      });
      
      // Atualizar templates localmente
      setTemplates(prev => prev.map(template => 
        ids.includes(template.id) ? { ...template, ...updates } : template
      ));
      
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar templates em lote';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const bulkDeleteTemplates = async (ids: string[]) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/templates/bulk-delete`, {
        method: 'DELETE',
        data: { ids },
      });
      setTemplates(prev => prev.filter(template => !ids.includes(template.id)));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar templates em lote';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const exportTemplates = async (format: 'json' | 'csv' = 'json') => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/templates/export?format=${format}`, {
        method: 'GET',
        responseType: 'blob',
      });
      
      // Criar download do arquivo
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `templates.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao exportar templates';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const importTemplates = async (templatesData: CreateTemplateData[]) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/templates/import`, {
        method: 'POST',
        data: { templates: templatesData },
      });
      
      // Adicionar novos templates à lista
      setTemplates(prev => [...response.data, ...prev]);
      
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao importar templates';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateFilters = (newFilters: TemplateFilters) => {
    setFilters(newFilters);
  };

  useEffect(() => {
    fetchTemplates();
  }, [filters]);

  return {
    templates,
    loading,
    error,
    filters,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    renderTemplate,
    bulkUpdateTemplates,
    bulkDeleteTemplates,
    exportTemplates,
    importTemplates,
    updateFilters,
  };
};
