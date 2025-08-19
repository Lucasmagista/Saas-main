
import { useState, useEffect, useCallback } from 'react';
import { makeAuthenticatedRequest } from '@/lib/api';

interface Bot {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  updated_at: string;
  user_id: string;
  is_active: boolean;
}

interface BotSession {
  session_id: string;
  bot_id: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qr_data?: string;
  created_at: string;
  updated_at: string;
}

interface BotStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
}

interface CreateBotData {
  name: string;
  user_id: string;
}

interface UpdateBotData {
  name?: string;
  is_active?: boolean;
}

export function useBots() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeAuthenticatedRequest('/api/bots', 'GET');
      setBots(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar bots');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBot = useCallback(async (botData: CreateBotData): Promise<Bot> => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeAuthenticatedRequest('/api/bots', 'POST', botData);
      setBots(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateBot = useCallback(async (botId: string, botData: UpdateBotData): Promise<Bot> => {
    setLoading(true);
    setError(null);
    try {
      const data = await makeAuthenticatedRequest(`/api/bots/${botId}`, 'PUT', botData);
      setBots(prev => prev.map(bot => bot.id === botId ? data : bot));
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteBot = useCallback(async (botId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await makeAuthenticatedRequest(`/api/bots/${botId}`, 'DELETE');
      setBots(prev => prev.filter(bot => bot.id !== botId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar bot');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBotStats = useCallback(async (): Promise<BotStats> => {
    try {
      const data = await makeAuthenticatedRequest('/api/bots/stats', 'GET');
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao buscar estatísticas');
    }
  }, []);

  const getBotSessions = useCallback(async (botId: string): Promise<BotSession[]> => {
    try {
      const data = await makeAuthenticatedRequest(`/api/bots/${botId}/sessions`, 'GET');
      return Array.isArray(data) ? data : [];
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao buscar sessões');
    }
  }, []);

  const connectBot = useCallback(async (botId: string): Promise<BotSession> => {
    try {
      const data = await makeAuthenticatedRequest(`/api/bots/${botId}/connect`, 'POST');
      return data;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao conectar bot');
    }
  }, []);

  const disconnectBot = useCallback(async (botId: string): Promise<void> => {
    try {
      await makeAuthenticatedRequest(`/api/bots/${botId}/disconnect`, 'POST');
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao desconectar bot');
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  return {
    bots,
    loading,
    error,
    fetchBots,
    createBot,
    updateBot,
    deleteBot,
    getBotStats,
    getBotSessions,
    connectBot,
    disconnectBot,
  };
}
