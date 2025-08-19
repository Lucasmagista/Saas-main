import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { makeAuthenticatedRequest } from '../../utils/api';
import { 
  Users, 
  MessageSquare, 
  Bot, 
  TrendingUp, 
  Activity, 
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

interface DashboardMetrics {
  users: {
    total: number;
    active: number;
    new: number;
  };
  messages: {
    total: number;
    sent: number;
    failed: number;
    delivered: number;
  };
  bots: {
    total: number;
    active: number;
    inactive: number;
  };
  performance: {
    response_time: number;
    uptime: number;
    error_rate: number;
  };
  webhooks: {
    total: number;
    active: number;
    deliveries: number;
    success_rate: number;
  };
}

export const DashboardMetrics: React.FC = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const response = await makeAuthenticatedRequest(`${API_BASE}/api/analytics/dashboard`);
      return response.data;
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">Erro</div>
            <p className="text-xs text-muted-foreground">
              Erro ao carregar métricas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Usuários */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuários</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.users.total}</div>
          <p className="text-xs text-muted-foreground">
            +{metrics.users.new} novos este mês
          </p>
        </CardContent>
      </Card>

      {/* Mensagens */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.messages.total}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.messages.sent} enviadas hoje
          </p>
        </CardContent>
      </Card>

      {/* Bots */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bots</CardTitle>
          <Bot className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.bots.total}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.bots.active} ativos
          </p>
        </CardContent>
      </Card>

      {/* Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Performance</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.performance.response_time}ms</div>
          <p className="text-xs text-muted-foreground">
            {metrics.performance.uptime}% uptime
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Entrega */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.messages.delivered}</div>
          <p className="text-xs text-muted-foreground">
            {((metrics.messages.delivered / metrics.messages.sent) * 100).toFixed(1)}% sucesso
          </p>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Webhooks</CardTitle>
          <Zap className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.webhooks.total}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.webhooks.active} ativos
          </p>
        </CardContent>
      </Card>

      {/* Tempo de Resposta */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tempo de Resposta</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.performance.response_time}ms</div>
          <p className="text-xs text-muted-foreground">
            Média dos últimos 24h
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Erro */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.performance.error_rate}%</div>
          <p className="text-xs text-muted-foreground">
            {metrics.messages.failed} falhas hoje
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
