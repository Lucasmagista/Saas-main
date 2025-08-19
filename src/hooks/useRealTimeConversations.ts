
import { useState, useEffect, useCallback } from 'react';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Conversation {
  id: string;
  title: string;
  participants: string[];
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
  status: 'active' | 'archived' | 'deleted';
  type: 'direct' | 'group';
  metadata?: any;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: 'text' | 'media' | 'file' | 'system';
  metadata?: any;
  created_at: string;
  read: boolean;
  delivered: boolean;
}

export interface UserPresence {
  user_id: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  last_seen: string;
  typing_in?: string;
}

export const useRealTimeConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userPresence, setUserPresence] = useState<UserPresence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Polling para simular tempo real (em produção, usar WebSocket)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/conversations`);
      setConversations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar conversas');
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/conversations/${conversationId}/messages`);
      setMessages(response.data);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao carregar mensagens';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const fetchUserPresence = useCallback(async () => {
    try {
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/presence`);
      setUserPresence(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar presença dos usuários');
      console.error('Erro ao buscar presença:', err);
    }
  }, []);

  const sendMessage = async (conversationId: string, content: string, type: 'text' | 'media' | 'file' | 'system' = 'text', metadata?: any) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        data: { content, type, metadata },
      });
      
      setMessages(prev => [...prev, response.data]);
      
      // Atualizar última mensagem na conversa
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              last_message: content,
              last_message_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          : conv
      ));
      
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao enviar mensagem';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/conversations/${conversationId}/read`, {
        method: 'PUT',
      });
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
      
      setMessages(prev => 
        prev.map(msg => 
          msg.conversation_id === conversationId 
            ? { ...msg, read: true }
            : msg
        )
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao marcar conversa como lida';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateUserPresence = async (status: 'online' | 'offline' | 'away' | 'busy', typingIn?: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/presence`, {
        method: 'PUT',
        data: { status, typing_in: typingIn },
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar presença';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Iniciar polling para simular tempo real
  const startPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
    
    const interval = setInterval(() => {
      fetchConversations();
      fetchUserPresence();
    }, 5000); // Poll a cada 5 segundos para conversas
    
    setPollingInterval(interval);
  }, [fetchConversations, fetchUserPresence, pollingInterval]);

  // Parar polling
  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [pollingInterval]);

  useEffect(() => {
    fetchConversations();
    fetchUserPresence();
    startPolling();

    return () => {
      stopPolling();
    };
  }, [fetchConversations, fetchUserPresence, startPolling, stopPolling]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  return {
    conversations,
    messages,
    userPresence,
    loading,
    error,
    fetchConversations,
    fetchMessages,
    fetchUserPresence,
    sendMessage,
    markConversationAsRead,
    updateUserPresence,
    startPolling,
    stopPolling,
  };
};
