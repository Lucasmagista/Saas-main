
import { useState, useEffect } from 'react';
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

export interface CreateConversationData {
  title: string;
  participants: string[];
  type?: 'direct' | 'group';
  metadata?: any;
}

export interface SendMessageData {
  conversation_id: string;
  content: string;
  type?: 'text' | 'media' | 'file' | 'system';
  metadata?: any;
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/conversations`);
      setConversations(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar conversas');
      console.error('Erro ao buscar conversas:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (conversationData: CreateConversationData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/conversations`, {
        method: 'POST',
        data: conversationData,
      });
      setConversations(prev => [...prev, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao criar conversa';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateConversation = async (id: string, updates: Partial<Conversation>) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/conversations/${id}`, {
        method: 'PUT',
        data: updates,
      });
      setConversations(prev => prev.map(conv => conv.id === id ? response.data : conv));
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao atualizar conversa';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/conversations/${id}`, {
        method: 'DELETE',
      });
      setConversations(prev => prev.filter(conv => conv.id !== id));
      // Limpar mensagens da conversa deletada
      setMessages(prev => prev.filter(msg => msg.conversation_id !== id));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar conversa';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const fetchMessages = async (conversationId: string) => {
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
  };

  const sendMessage = async (messageData: SendMessageData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/conversations/${messageData.conversation_id}/messages`, {
        method: 'POST',
        data: messageData,
      });
      setMessages(prev => [...prev, response.data]);
      
      // Atualizar última mensagem na conversa
      setConversations(prev => prev.map(conv => 
        conv.id === messageData.conversation_id 
          ? { 
              ...conv, 
              last_message: messageData.content,
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

  const markMessageAsRead = async (messageId: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/messages/${messageId}/read`, {
        method: 'PUT',
      });
      setMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, read: true } : msg)
      );
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao marcar mensagem como lida';
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

  const deleteMessage = async (messageId: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/messages/${messageId}`, {
        method: 'DELETE',
      });
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Erro ao deletar mensagem';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return {
    conversations,
    messages,
    loading,
    error,
    fetchConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    markConversationAsRead,
    deleteMessage,
  };
};
