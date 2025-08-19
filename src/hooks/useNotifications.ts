
import { useState, useEffect } from 'react';
import { makeAuthenticatedRequest } from '@/utils/api';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
  user_id: string;
  data?: Record<string, unknown>;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  data?: Record<string, unknown>;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/notifications`);
      setNotifications(response.data);
      setUnreadCount(response.data.filter((n: Notification) => !n.read).length);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar notificações';
      setError(errorMsg);
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const createNotification = async (notificationData: CreateNotificationData) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/notifications`, {
        method: 'POST',
        data: notificationData,
      });
      setNotifications(prev => [response.data, ...prev]);
      setUnreadCount(prev => prev + 1);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar notificação';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
      });
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao marcar notificação como lida';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const markAllAsRead = async () => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
      });
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao marcar todas as notificações como lidas';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE',
      });
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao deletar notificação';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await makeAuthenticatedRequest(`${API_BASE}/api/notifications/clear-all`, {
        method: 'DELETE',
      });
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao limpar notificações';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getNotificationSettings = async () => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/notifications/settings`);
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao carregar configurações de notificação';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const updateNotificationSettings = async (settings: Record<string, unknown>) => {
    try {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/notifications/settings`, {
        method: 'PUT',
        data: settings,
      });
      return response.data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar configurações de notificação';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getNotificationSettings,
    updateNotificationSettings,
  };
};
