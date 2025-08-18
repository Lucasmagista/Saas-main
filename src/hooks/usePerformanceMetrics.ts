
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PerformanceMetric {
  id: string;
  organization_id: string;
  metric_name: string;
  metric_value: number;
  metric_type: string;
  metadata: any;
  recorded_at: string;
}

export interface CacheEntry {
  id: string;
  organization_id: string;
  cache_key: string;
  cache_value: any;
  expires_at: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  metadata: any;
  created_at: string;
}

export const usePerformanceMetrics = (metricName?: string, timeRange?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['performance-metrics', metricName, timeRange],
    queryFn: async () => {
      let query = supabase
        .from('performance_metrics')
        .select('*')
        .order('recorded_at', { ascending: false });

      if (metricName) {
        query = query.eq('metric_name', metricName);
      }

      if (timeRange) {
        const date = new Date();
        switch (timeRange) {
          case '24h':
            date.setHours(date.getHours() - 24);
            break;
          case '7d':
            date.setDate(date.getDate() - 7);
            break;
          case '30d':
            date.setDate(date.getDate() - 30);
            break;
        }
        query = query.gte('recorded_at', date.toISOString());
      }

      const { data, error } = await query.limit(1000);

      if (error) {
        toast({
          title: 'Erro ao carregar métricas',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as PerformanceMetric[];
    },
  });
};

export const useRecordMetric = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (metric: Omit<PerformanceMetric, 'id' | 'recorded_at'>) => {
      const { data, error } = await supabase
        .from('performance_metrics')
        .insert(metric)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-metrics'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao registrar métrica',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useAuditLogs = (resourceType?: string, userId?: string) => {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['audit-logs', resourceType, userId],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs_v2')
        .select('*')
        .order('created_at', { ascending: false });

      if (resourceType) {
        query = query.eq('resource_type', resourceType);
      }

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.limit(500);

      if (error) {
        toast({
          title: 'Erro ao carregar logs',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }

      return data as AuditLog[];
    },
  });
};

export const useCreateAuditLog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: Omit<AuditLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('audit_logs_v2')
        .insert(log)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
  });
};

export const useCacheEntry = (key: string) => {
  return useQuery({
    queryKey: ['cache-entry', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cache_entries')
        .select('*')
        .eq('cache_key', key)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data as CacheEntry | null;
    },
  });
};

export const useSetCacheEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value, ttl }: { key: string; value: any; ttl: number }) => {
      const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('cache_entries')
        .upsert({
          cache_key: key,
          cache_value: value,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['cache-entry', data.cache_key], data);
    },
  });
};

export const useCleanupCache = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .rpc('cleanup_expired_cache');

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Cache limpo',
        description: 'Entradas expiradas removidas com sucesso.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao limpar cache',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
