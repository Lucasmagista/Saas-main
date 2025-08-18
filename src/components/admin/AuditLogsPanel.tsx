import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ClipboardList, 
  User,
  Calendar,
  Activity,
  Eye
} from 'lucide-react';
import { AuditLogEntry } from '@/hooks/useAdminDashboard';

interface AuditLogsPanelProps {
  auditLogs: AuditLogEntry[] | undefined;
  loading: boolean;
}

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({
  auditLogs,
  loading,
}) => {
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');

  const filteredLogs = auditLogs?.filter(log => {
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource_type === resourceFilter;
    return matchesAction && matchesResource;
  }) || [];

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
      case 'insert':
        return 'bg-green-100 text-green-800';
      case 'update':
      case 'edit':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
      case 'remove':
        return 'bg-red-100 text-red-800';
      case 'login':
        return 'bg-purple-100 text-purple-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'error':
      case 'failed_login':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'login':
      case 'logout':
        return <User className="h-3 w-3" />;
      default:
        return <Activity className="h-3 w-3" />;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const uniqueActions = [...new Set(auditLogs?.map(log => log.action) || [])];
  const uniqueResources = [...new Set(auditLogs?.map(log => log.resource_type) || [])];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs de Auditoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 10 }, (_, i) => (
                <Skeleton key={`audit-skeleton-${i + 1}`} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Logs de Auditoria
          </CardTitle>
          <Badge variant="outline">
            {filteredLogs.length} registros
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              {uniqueActions.map((action) => (
                <SelectItem key={action} value={action}>
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resourceFilter} onValueChange={setResourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filtrar por recurso" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os recursos</SelectItem>
              {uniqueResources.map((resource) => (
                <SelectItem key={resource} value={resource}>
                  {resource}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Estatísticas dos logs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {auditLogs?.filter(log => log.action === 'login').length || 0}
            </div>
            <div className="text-sm text-blue-600">Logins hoje</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {auditLogs?.filter(log => 
                ['create', 'update', 'delete'].includes(log.action.toLowerCase())
              ).length || 0}
            </div>
            <div className="text-sm text-orange-600">Modificações</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {auditLogs?.filter(log => 
                log.action.toLowerCase().includes('error') || 
                log.action.toLowerCase().includes('failed')
              ).length || 0}
            </div>
            <div className="text-sm text-red-600">Erros/Falhas</div>
          </div>
        </div>

        {/* Lista de logs */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum log encontrado com os filtros selecionados
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-full ${getActionColor(log.action)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={getActionColor(log.action)}
                        >
                          {log.action}
                        </Badge>
                        <span className="text-sm font-medium">
                          {log.resource_type}
                        </span>
                        {log.resource_id && (
                          <span className="text-xs text-gray-500">
                            ID: {log.resource_id}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">{log.user_email}</span>
                        {log.ip_address && (
                          <span className="text-gray-400"> • {log.ip_address}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(log.created_at)}
                    </div>
                    <Button size="sm" variant="ghost">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Paginação */}
        {filteredLogs.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Mostrando os últimos {filteredLogs.length} logs
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Exportar Logs
              </Button>
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
