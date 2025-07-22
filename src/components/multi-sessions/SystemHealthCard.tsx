
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Server, Database, Wifi, Cpu, HardDrive, 
  MemoryStick, AlertTriangle, CheckCircle2, Clock
} from "lucide-react";

export function SystemHealthCard() {
  const systemMetrics = {
    server: {
      status: 'online',
      uptime: '15d 8h 23m',
      cpu: 35,
      memory: 68,
      disk: 42,
      network: 15
    },
    database: {
      status: 'online',
      connections: 45,
      maxConnections: 100,
      queryTime: 2.3,
      storage: 78
    },
    websocket: {
      status: 'online',
      activeConnections: 234,
      messageRate: 1250,
      latency: 45
    },
    apis: [
      { name: 'WhatsApp API', status: 'online', latency: 120 },
      { name: 'OpenAI API', status: 'online', latency: 350 },
      { name: 'Telegram API', status: 'online', latency: 89 },
      { name: 'Discord API', status: 'degraded', latency: 890 }
    ]
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

  return (
    <div className="space-y-6">
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
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Online
              </Badge>
              <span className="text-sm text-gray-500">
                {systemMetrics.database.connections}/{systemMetrics.database.maxConnections} conexões
              </span>
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
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Online
              </Badge>
              <span className="text-sm text-gray-500">
                {systemMetrics.websocket.activeConnections} conexões
              </span>
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
          <div className="space-y-4">
            {systemMetrics.apis.map((api, index) => {
              const StatusIcon = getStatusIcon(api.status);
              
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <StatusIcon className={`w-4 h-4 ${
                      api.status === 'online' ? 'text-green-600' : 
                      api.status === 'degraded' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <span className="font-medium">{api.name}</span>
                    <Badge className={getStatusColor(api.status)}>
                      {api.status}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {api.latency}ms
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Log de Eventos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recentes</CardTitle>
          <CardDescription>Histórico de atividades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { time: '14:23', type: 'info', message: 'Sistema iniciado com sucesso' },
              { time: '14:21', type: 'warning', message: 'Alta latência detectada na Discord API' },
              { time: '14:18', type: 'success', message: 'Backup automático concluído' },
              { time: '14:15', type: 'info', message: 'Nova sessão WhatsApp conectada' },
              { time: '14:12', type: 'error', message: 'Falha na conexão com Telegram API (recuperada)' }
            ].map((event, index) => (
              <div key={index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                <span className="text-xs text-gray-500 mt-1 w-12">{event.time}</span>
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  event.type === 'success' ? 'bg-green-500' :
                  event.type === 'warning' ? 'bg-yellow-500' :
                  event.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}></div>
                <span className="text-sm text-gray-700 flex-1">{event.message}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
