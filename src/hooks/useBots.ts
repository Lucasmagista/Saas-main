
import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Bot {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  qrcode?: string;
  session_name?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  total_messages?: number;
  last_activity?: string;
}

export interface CreateBotData {
  name: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateBotData {
  name?: string;
  description?: string;
  is_active?: boolean;
}

export const useBots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBots = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots`);
      setBots(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar bots');
      console.error('Erro ao buscar bots:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBot = async (botData: CreateBotData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots`, {
        method: 'POST',
        data: botData,
      });
      setBots(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar bot';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateBot = async (id: string, botData: UpdateBotData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots/${id}`, {
        method: 'PUT',
        data: botData,
      });
      setBots(prev => prev.map(bot => bot.id === id ? response.data : bot));
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar bot';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteBot = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/bots/${id}`, {
        method: 'DELETE',
      });
      setBots(prev => prev.filter(bot => bot.id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar bot';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const startBotSession = async (id: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots/${id}/start`, {
        method: 'POST',
      });
      // Atualizar o bot com o QR code se retornado
      if (response.data.qrcode) {
        setBots(prev => prev.map(bot => 
          bot.id === id ? { ...bot, qrcode: response.data.qrcode, is_active: true } : bot
        ));
      }
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao iniciar sessão do bot';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const stopBotSession = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/bots/${id}/stop`, {
        method: 'POST',
      });
      // Atualizar o bot removendo o QR code
      setBots(prev => prev.map(bot => 
        bot.id === id ? { ...bot, qrcode: undefined, is_active: false } : bot
      ));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao parar sessão do bot';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getBotQrCode = async (id: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/bots/${id}/qrcode`);
      return response.data.qrcode;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao obter QR code do bot';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  return {
    bots,
    loading,
    error,
    fetchBots,
    createBot,
    updateBot,
    deleteBot,
    startBotSession,
    stopBotSession,
    getBotQrCode,
  };
};
