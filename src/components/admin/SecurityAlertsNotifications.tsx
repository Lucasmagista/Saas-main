import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock } from 'lucide-react';
import { SecurityAlert, AdminNotification } from '@/hooks/useAdminDashboard';

interface SecurityAlertsNotificationsProps {
  securityAlerts: SecurityAlert[] | undefined;
  notifications: AdminNotification[];
  alertsLoading: boolean;
  onResolveAlert: (alertId: string) => void;
  onMarkNotificationAsRead: (notificationId: string) => void;
  onMarkAllNotificationsAsRead: () => void;
}

export const SecurityAlertsNotifications: React.FC<SecurityAlertsNotificationsProps> = ({
  securityAlerts,
  notifications,
  alertsLoading,
  onResolveAlert,
  onMarkNotificationAsRead,
  onMarkAllNotificationsAsRead,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const formatTime = (dateTime: string) => {
    const now = new Date();
    const time = new Date(dateTime);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Alertas de Segurança */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-500" />
              Alertas de Segurança
            </CardTitle>
            <Badge variant="destructive">
              {securityAlerts?.filter(alert => !alert.resolved).length || 0} ativos
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {alertsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={`security-skeleton-${i + 1}`} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {securityAlerts?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                  <div>Nenhum alerta de segurança</div>
                  <div className="text-sm">Sistema seguro</div>
                </div>
              ) : (
                securityAlerts?.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-4 border rounded-lg ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {alert.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="font-medium text-sm mb-1">
                          {alert.message}
                        </div>
                        <div className="text-xs opacity-75">
                          IP: {alert.ip_address} • {formatTime(alert.created_at)}
                        </div>
                      </div>
                      {!alert.resolved && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onResolveAlert(alert.id)}
                        >
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificações Administrativas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-500" />
              Notificações
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {notifications.filter(n => !n.read).length} não lidas
              </Badge>
              {notifications.filter(n => !n.read).length > 0 && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={onMarkAllNotificationsAsRead}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <div>Nenhuma notificação</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`p-4 border rounded-lg cursor-pointer transition-colors text-left w-full ${
                    notification.read 
                      ? 'bg-gray-50 border-gray-200 opacity-75' 
                      : 'bg-white border-blue-200 hover:bg-blue-50 shadow-sm'
                  }`}
                  onClick={() => onMarkNotificationAsRead(notification.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onMarkNotificationAsRead(notification.id);
                    }
                  }}
                  tabIndex={0}
                  aria-label={
                    notification.read 
                      ? `Notificação lida: ${notification.title}` 
                      : `Marcar como lida: ${notification.title}`
                  }
                >
                  <div className="flex items-start gap-3">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm ${
                          notification.read ? 'text-gray-600' : 'text-gray-900'
                        }`}>
                          {notification.title}
                        </span>
                        {notification.action_required && (
                          <Badge variant="destructive" className="text-xs">
                            Ação necessária
                          </Badge>
                        )}
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <div className={`text-sm mb-2 ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
