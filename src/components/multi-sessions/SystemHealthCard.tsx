
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Server, Database, Wifi, Cpu, HardDrive, 
  MemoryStick, AlertTriangle, CheckCircle2, Clock
} from "lucide-react";
import { api } from "@/lib/api";
import Skeleton from 'react-loading-skeleton';

interface SystemMetrics {
  server: {
    status: string;
    uptime: string;
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  database: {
    status: string;
    connections: number;
    maxConnections: number;
    queryTime: number;
    storage: number;
  };
  websocket: {
    status: string;
    activeConnections: number;
    messageRate: number;
    latency: number;
  };
  apis: Array<{
    name: string;
    status: string;
    latency: number;
  }>;
  events: Array<{
    time: string;
    type: string;
    message: string;
  }>;
}

// Skeleton loading component
function SystemHealthSkeleton() {
  const skeletonCards = Array.from({ length: 3 }, (_, i) => ({ id: `skeleton-${Date.now()}-${i}` }));
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {skeletonCards.map((card) => (
          <Card key={card.id}>
            <CardHeader className="pb-2">
              <Skeleton height={20} width={120} />
            </CardHeader>
            <CardContent>
              <Skeleton height={40} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton height={24} width={180} />
        </CardHeader>
        <CardContent>
          <Skeleton height={120} />
        </CardContent>
      </Card>
    </div>
  );
}

export function SystemHealthCard() {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [testingAPI, setTestingAPI] = useState<string | null>(null);
  // Função para buscar métricas do sistema da API
  useEffect(() => {
    const fetchSystemHealth = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get('/api/analytics/system-health');
        
        if (response.success) {
          setSystemMetrics(response.data);
        }
      } catch (err) {
        console.error('Erro ao buscar métricas do sistema:', err);
        setError('Erro ao carregar métricas do sistema');
        // Define dados vazios em caso de erro
        setSystemMetrics({
          server: {
            status: 'offline',
            uptime: '—',
            cpu: 0,
            memory: 0,
            disk: 0,
            network: 0
          },
          database: {
            status: 'offline',
            connections: 0,
            maxConnections: 100,
            queryTime: 0,
            storage: 0
          },
          websocket: {
            status: 'offline',
            activeConnections: 0,
            messageRate: 0,
            latency: 0
          },
          apis: [],
          events: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSystemHealth();
    
    // Atualiza métricas a cada 30 segundos
    const interval = setInterval(fetchSystemHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Função para atualização manual
  const handleRefresh = async () => {
    setRefreshing(true);
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/analytics/system-health');
      
      if (response.success) {
        setSystemMetrics(response.data);
      }
    } catch (err) {
      console.error('Erro ao atualizar métricas do sistema:', err);
      setError('Erro ao atualizar métricas do sistema');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Função para testar uma API específica
  const handleTestAPI = async (apiName: string) => {
    setTestingAPI(apiName);
    
    try {
      const response = await api.post('/api/analytics/test-api', { apiName });
      
      if (response.success && systemMetrics) {
        // Atualiza o status da API testada
        const updatedAPIs = systemMetrics.apis.map(api => 
          api.name === apiName ? response.data : api
        );
        
        setSystemMetrics({
          ...systemMetrics,
          apis: updatedAPIs
        });
      }
    } catch (err) {
      console.error('Erro ao testar API:', err);
    } finally {
      setTestingAPI(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'offline': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return CheckCircle2;
      case 'degraded': case 'offline': return AlertTriangle;
      default: return Clock;
    }
  };

  const getIconColorClass = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'offline': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEventColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (loading) {
    return <SystemHealthSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline" 
              className="mt-2"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!systemMetrics) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com botão de atualizar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Saúde do Sistema</h2>
          <p className="text-gray-600">Monitoramento em tempo real</p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          variant="outline"
          size="sm"
        >
          {refreshing ? (
            <>
              <Clock className="w-4 h-4 mr-2 animate-spin" />
              Atualizando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Atualizar
            </>
          )}
        </Button>
      </div>

      {/* Status Geral do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servidor Principal</CardTitle>
            <Server className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Badge className={getStatusColor(systemMetrics.server.status)}>
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Online
              </Badge>
              <span className="text-sm text-gray-500">Uptime: {systemMetrics.server.uptime}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Badge className={getStatusColor(systemMetrics.database.status)}>
                {systemMetrics.database.status === 'online' ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {systemMetrics.database.status}
              </Badge>
              <span className="text-sm text-gray-500">
                Query: {systemMetrics.database.queryTime}ms
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Conexões: {systemMetrics.database.connections}/{systemMetrics.database.maxConnections}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WebSocket</CardTitle>
            <Wifi className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <Badge className={getStatusColor(systemMetrics.websocket.status)}>
                {systemMetrics.websocket.status === 'online' ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <AlertTriangle className="w-3 h-3 mr-1" />
                )}
                {systemMetrics.websocket.status}
              </Badge>
              <span className="text-sm text-gray-500">
                {systemMetrics.websocket.activeConnections} conexões
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Latência: {systemMetrics.websocket.latency}ms | Taxa: {systemMetrics.websocket.messageRate}/min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance do Sistema</CardTitle>
          <CardDescription>Métricas de recursos em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">CPU</span>
                </div>
                <span className="text-sm text-gray-600">{systemMetrics.server.cpu}%</span>
              </div>
              <Progress value={systemMetrics.server.cpu} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MemoryStick className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Memória</span>
                </div>
                <span className="text-sm text-gray-600">{systemMetrics.server.memory}%</span>
              </div>
              <Progress value={systemMetrics.server.memory} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium">Disco</span>
                </div>
                <span className="text-sm text-gray-600">{systemMetrics.server.disk}%</span>
              </div>
              <Progress value={systemMetrics.server.disk} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Rede</span>
                </div>
                <span className="text-sm text-gray-600">{systemMetrics.server.network}%</span>
              </div>
              <Progress value={systemMetrics.server.network} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status das APIs Externas */}
      <Card>
        <CardHeader>
          <CardTitle>APIs Externas</CardTitle>
          <CardDescription>Status e latência dos serviços integrados</CardDescription>
        </CardHeader>
        <CardContent>
          {systemMetrics.apis.length === 0 ? (
            <div className="text-center py-8">
              <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma API configurada
              </h3>
              <p className="text-gray-500">
                Configure APIs externas para monitorar seu status.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {systemMetrics.apis.map((api) => {
                const StatusIcon = getStatusIcon(api.status);
                const iconColorClass = getIconColorClass(api.status);
                
                return (
                  <div key={`api-${api.name}`} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`w-4 h-4 ${iconColorClass}`} />
                      <span className="font-medium">{api.name}</span>
                      <Badge className={getStatusColor(api.status)}>
                        {api.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {api.latency}ms
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestAPI(api.name)}
                        disabled={testingAPI === api.name}
                      >
                        {testingAPI === api.name ? (
                          <>
                            <Clock className="w-3 h-3 mr-1 animate-spin" />
                            Testando
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Testar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log de Eventos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>Histórico de atividades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          {systemMetrics.events.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum evento recente
              </h3>
              <p className="text-gray-500">
                Os eventos do sistema aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {systemMetrics.events.map((event, index) => {
                const eventColorClass = getEventColorClass(event.type);
                
                return (
                  <div key={`event-${index}-${event.time}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <span className="text-xs text-gray-500 mt-1 w-12">{event.time}</span>
                    <div className={`w-2 h-2 rounded-full mt-2 ${eventColorClass}`}></div>
                    <span className="text-sm text-gray-700 flex-1">{event.message}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
