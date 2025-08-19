
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '../utils/api';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface PerformanceMetric {
  id: string;
  name: string;
  description: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: string;
}

export interface MetricAlert {
  id: string;
  metric_name: string;
  condition: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_at: string;
}

export interface MetricDashboard {
  id: string;
  name: string;
  description: string;
  layout: any;
  metrics: string[];
  created_by: string;
  created_at: string;
}

// Hooks para Métricas
export const usePerformanceMetrics = (filters?: any) => {
  return useQuery({
    queryKey: ['performance-metrics', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, String(value));
        });
      }
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/performance?${params}`);
      return response.data;
    }
  });
};

export const useSystemMetrics = (timeRange = '1h') => {
  return useQuery({
    queryKey: ['system-metrics', timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/system?timeRange=${timeRange}`);
      return response.data;
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });
};

export const useApplicationMetrics = (timeRange = '1h') => {
  return useQuery({
    queryKey: ['application-metrics', timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/application?timeRange=${timeRange}`);
      return response.data;
    },
    refetchInterval: 60000 // Atualizar a cada minuto
  });
};

export const useDatabaseMetrics = (timeRange = '1h') => {
  return useQuery({
    queryKey: ['database-metrics', timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/database?timeRange=${timeRange}`);
      return response.data;
    },
    refetchInterval: 30000
  });
};

export const useCustomMetrics = (metricName?: string) => {
  return useQuery({
    queryKey: ['custom-metrics', metricName],
    queryFn: async () => {
      const params = metricName ? `?name=${metricName}` : '';
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/custom${params}`);
      return response.data;
    }
  });
};

export const useCreateCustomMetric = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (metricData: Partial<PerformanceMetric>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/custom`, {
        method: 'POST',
        data: metricData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-metrics'] });
      toast.success('Métrica criada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar métrica');
    }
  });
};

// Hooks para Alertas
export const useMetricAlerts = () => {
  return useQuery({
    queryKey: ['metric-alerts'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/alerts`);
      return response.data;
    }
  });
};

export const useCreateMetricAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (alertData: Partial<MetricAlert>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/alerts`, {
        method: 'POST',
        data: alertData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-alerts'] });
      toast.success('Alerta criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar alerta');
    }
  });
};

export const useUpdateMetricAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...alertData }: Partial<MetricAlert> & { id: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/alerts/${id}`, {
        method: 'PUT',
        data: alertData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-alerts'] });
      toast.success('Alerta atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar alerta');
    }
  });
};

export const useDeleteMetricAlert = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await makeAuthenticatedRequest(`${API_BASE}/api/metrics/alerts/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-alerts'] });
      toast.success('Alerta removido com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao remover alerta');
    }
  });
};

// Hooks para Dashboards
export const useMetricDashboards = () => {
  return useQuery({
    queryKey: ['metric-dashboards'],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/dashboards`);
      return response.data;
    }
  });
};

export const useCreateMetricDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dashboardData: Partial<MetricDashboard>) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/dashboards`, {
        method: 'POST',
        data: dashboardData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-dashboards'] });
      toast.success('Dashboard criado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao criar dashboard');
    }
  });
};

export const useUpdateMetricDashboard = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...dashboardData }: Partial<MetricDashboard> & { id: string }) => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/dashboards/${id}`, {
        method: 'PUT',
        data: dashboardData
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metric-dashboards'] });
      toast.success('Dashboard atualizado com sucesso!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Erro ao atualizar dashboard');
    }
  });
};

// Hooks para Analytics
export const usePerformanceAnalytics = (timeRange = '24h') => {
  return useQuery({
    queryKey: ['performance-analytics', timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/analytics?timeRange=${timeRange}`);
      return response.data;
    }
  });
};

export const useMetricTrends = (metricName: string, timeRange = '7d') => {
  return useQuery({
    queryKey: ['metric-trends', metricName, timeRange],
    queryFn: async () => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/trends?metric=${metricName}&timeRange=${timeRange}`);
      return response.data;
    }
  });
};

export const useMetricComparison = (metricName: string, timeRanges: string[]) => {
  return useQuery({
    queryKey: ['metric-comparison', metricName, timeRanges],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('metric', metricName);
      timeRanges.forEach(range => params.append('timeRanges', range));
      
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/metrics/comparison?${params}`);
      return response.data;
    }
  });
};
