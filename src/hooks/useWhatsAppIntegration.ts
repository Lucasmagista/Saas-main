
import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface WhatsAppSession {
  id: string;
  bot_id: string;
  session_name: string;
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  qr_code?: string;
  phone_number?: string;
  created_at: string;
  updated_at: string;
  last_activity?: string;
  metadata?: any;
}

export interface WhatsAppMessage {
  id: string;
  session_id: string;
  from: string;
  to: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  direction: 'in' | 'out';
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  metadata?: any;
}

export interface SendMessageData {
  to: string;
  content: string;
  type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact';
  metadata?: any;
}

export const useWhatsAppIntegration = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions`);
      setSessions(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar sessões WhatsApp');
      console.error('Erro ao buscar sessões WhatsApp:', err);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (botId: string, sessionName: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions`, {
        method: 'POST',
        data: { bot_id: botId, session_name: sessionName },
      });
      setSessions(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar sessão WhatsApp';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}/start`, {
        method: 'POST',
      });
      
      // Atualizar sessão com QR code se retornado
      if (response.data.qr_code) {
        setSessions(prev => prev.map(session => 
          session.id === sessionId 
            ? { ...session, qr_code: response.data.qr_code, status: 'connecting' }
            : session
        ));
      }
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao iniciar sessão WhatsApp';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const stopSession = async (sessionId: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}/stop`, {
        method: 'POST',
      });
      
      // Atualizar status da sessão
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'disconnected', qr_code: undefined }
          : session
      ));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao parar sessão WhatsApp';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar sessão WhatsApp';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getSessionQrCode = async (sessionId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}/qrcode`);
      return response.data.qr_code;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao obter QR code da sessão';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const fetchMessages = async (sessionId: string) => {
    try {
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}/messages`);
      setMessages(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao carregar mensagens WhatsApp';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const sendMessage = async (sessionId: string, messageData: SendMessageData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}/messages`, {
        method: 'POST',
        data: messageData,
      });
      
      setMessages(prev => [...prev, response.data]);
      
      // Atualizar última atividade da sessão
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, last_activity: new Date().toISOString() }
          : session
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao enviar mensagem WhatsApp';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getSessionStatus = async (sessionId: string) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}/status`);
      
      // Atualizar status da sessão
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: response.data.status, phone_number: response.data.phone_number }
          : session
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao obter status da sessão';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateSession = async (sessionId: string, updates: Partial<WhatsAppSession>) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/whatsapp/sessions/${sessionId}`, {
        method: 'PUT',
        data: updates,
      });
      
      setSessions(prev => prev.map(session => 
        session.id === sessionId ? response.data : session
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar sessão WhatsApp';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return {
    sessions,
    messages,
    loading,
    error,
    fetchSessions,
    createSession,
    startSession,
    stopSession,
    deleteSession,
    getSessionQrCode,
    fetchMessages,
    sendMessage,
    getSessionStatus,
    updateSession,
  };
};
