import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  MessageSquare, 
  Users, 
  Clock, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  BarChart3
} from 'lucide-react';

interface BotMetrics {
  uptime: string;
  messagesReceived: number;
  messagesSent: number;
  activeChats: number;
  averageResponseTime: number;
  errorCount: number;
  successRate: number;
  queueSize: number;
}

interface BotStatusMonitorProps {
  botId: string;
  botName: string;
}

export function BotStatusMonitor({ botId, botName }: BotStatusMonitorProps) {
  const [metrics, setMetrics] = useState<BotMetrics>({
    uptime: '2h 45min',
    messagesReceived: 123,
    messagesSent: 118,
    activeChats: 15,
    averageResponseTime: 2.3,
    errorCount: 2,
    successRate: 98.4,
    queueSize: 3
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const refreshMetrics = async () => {
    setIsRefreshing(true);
    try {
      // Simulação de chamada para API para buscar métricas reais
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Atualizar com dados simulados (substituir por API real)
      setMetrics(prev => ({
        ...prev,
        messagesReceived: prev.messagesReceived + Math.floor(Math.random() * 5),
        messagesSent: prev.messagesSent + Math.floor(Math.random() * 5),
        activeChats: Math.max(0, prev.activeChats + Math.floor(Math.random() * 3) - 1),
        averageResponseTime: Number((prev.averageResponseTime + (Math.random() - 0.5)).toFixed(1)),
      }));
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao atualizar métricas:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(refreshMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusBadge = (rate: number) => {
    if (rate >= 95) return <Badge variant="default" className="bg-green-500">Excelente</Badge>;
    if (rate >= 90) return <Badge variant="secondary" className="bg-yellow-500">Bom</Badge>;
    return <Badge variant="destructive">Atenção</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Monitor do Bot: {botName}</h3>
          <p className="text-sm text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Cards de métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.uptime}</div>
            <p className="text-xs text-muted-foreground">Tempo ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-green-500" />
              Mensagens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.messagesSent}/{metrics.messagesReceived}
            </div>
            <p className="text-xs text-muted-foreground">Enviadas/Recebidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              Chats Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.activeChats}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.queueSize > 0 && `${metrics.queueSize} na fila`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              Resp. Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">Tempo de resposta</p>
          </CardContent>
        </Card>
      </div>

      {/* Status geral e métricas detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Status Geral
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taxa de Sucesso</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${getStatusColor(metrics.successRate)}`}>
                  {metrics.successRate}%
                </span>
                {getStatusBadge(metrics.successRate)}
              </div>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.successRate >= 95 ? 'bg-green-500' :
                  metrics.successRate >= 90 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.successRate}%` }}
              ></div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Mensagens Entregues</span>
                </div>
                <span className="text-sm font-medium">{metrics.messagesSent}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm">Erros</span>
                </div>
                <span className="text-sm font-medium">{metrics.errorCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">Taxa de Conversão</span>
                </div>
                <span className="text-sm font-medium">85.2%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Atividade Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-3">
                {[
                  { time: '14:32', event: 'Mensagem enviada', user: '+55 11 99999-9999', status: 'success' },
                  { time: '14:31', event: 'Nova conversa iniciada', user: '+55 11 88888-8888', status: 'info' },
                  { time: '14:29', event: 'Mensagem recebida', user: '+55 11 77777-7777', status: 'info' },
                  { time: '14:28', event: 'Erro ao enviar mensagem', user: '+55 11 66666-6666', status: 'error' },
                  { time: '14:27', event: 'Mensagem enviada', user: '+55 11 55555-5555', status: 'success' },
                  { time: '14:25', event: 'Conversa encerrada', user: '+55 11 44444-4444', status: 'info' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 text-sm">
                    <div className="w-12 text-xs text-muted-foreground">{activity.time}</div>
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.event}</div>
                      <div className="text-xs text-muted-foreground">{activity.user}</div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e notificações */}
      {(metrics.errorCount > 5 || metrics.successRate < 90 || metrics.queueSize > 10) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.errorCount > 5 && (
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <XCircle className="w-4 h-4" />
                  Alto número de erros detectado ({metrics.errorCount})
                </div>
              )}
              {metrics.successRate < 90 && (
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  Taxa de sucesso abaixo do esperado ({metrics.successRate}%)
                </div>
              )}
              {metrics.queueSize > 10 && (
                <div className="flex items-center gap-2 text-sm text-orange-800">
                  <Clock className="w-4 h-4" />
                  Fila de mensagens muito grande ({metrics.queueSize})
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
