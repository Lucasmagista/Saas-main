import { useQuery } from '@tanstack/react-query';

export interface BotRecord {
  id: string;
  name: string;
  session_name: string | null;
  qrcode: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
  organization_id: string | null;
  description: string | null;
}

const API_BASE = (import.meta as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE || 'http://localhost:3002';

// Função para buscar bots com fallback
async function fetchBots(): Promise<BotRecord[]> {
  try {
    // Primeiro tenta a API local
    const response = await fetch(`${API_BASE}/api/bots`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Garantir que sempre retorna um array
    if (!Array.isArray(data)) {
      console.warn('API retornou dados não-array:', data);
      return [];
    }

    return data as BotRecord[];
  } catch (error) {
    console.error('Erro ao buscar bots da API:', error);
    
    // Fallback: retorna array vazio em caso de erro
    return [];
  }
}

// Hook para listar bots cadastrados com tratamento de erro robusto
export const useBotList = () => {
  return useQuery<BotRecord[]>({
    queryKey: ['botList'],
    queryFn: fetchBots,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    onError: (error) => {
      console.error('Erro no hook useBotList:', error);
    }
  });
};

// Hook para buscar um bot específico
export const useBot = (id: string) => {
  return useQuery<BotRecord>({
    queryKey: ['bot', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/bots/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!id,
    retry: 2,
    staleTime: 60000, // 1 minuto
  });
};

// Hook para buscar status de um bot
export const useBotStatus = (id: string) => {
  return useQuery<{ active: boolean }>({
    queryKey: ['botStatus', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/bots/${id}/status`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    enabled: !!id,
    refetchInterval: 5000, // Atualiza a cada 5 segundos
    staleTime: 0, // Sempre considera stale para refetch
  });
};

// Hook para buscar logs de um bot
export const useBotLogs = (id: string) => {
  return useQuery<{ logs: Array<{
    id: string;
    message: string;
    timestamp: string;
    type: string;
  }> }>({
    queryKey: ['botLogs', id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/bots/${id}/logs`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Garantir que logs é sempre um array
      return {
        logs: Array.isArray(data.logs) ? data.logs : []
      };
    },
    enabled: !!id,
    staleTime: 10000, // 10 segundos
  });
};