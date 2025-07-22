
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Server, Activity, Zap, AlertTriangle } from "lucide-react";

export const LoadBalancer = () => {
  const servers = [
    { id: 1, name: "Server-01", ip: "192.168.1.10", load: 75, status: "healthy", requests: 1250 },
    { id: 2, name: "Server-02", ip: "192.168.1.11", load: 45, status: "healthy", requests: 890 },
    { id: 3, name: "Server-03", ip: "192.168.1.12", load: 90, status: "warning", requests: 1450 },
    { id: 4, name: "Server-04", ip: "192.168.1.13", load: 20, status: "healthy", requests: 420 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "default";
      case "warning": return "secondary";
      case "critical": return "destructive";
      default: return "outline";
    }
  };

  const getLoadColor = (load: number) => {
    if (load >= 80) return "text-red-600";
    if (load >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Load Balancer</h2>
          <p className="text-muted-foreground">Distribuição de carga entre servidores</p>
        </div>
        <Button>
          <Server className="h-4 w-4 mr-2" />
          Adicionar Servidor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              Servidores Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">de 6 disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Requests/min
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4,010</div>
            <p className="text-xs text-muted-foreground">+12% vs última hora</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Carga Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">57.5%</div>
            <p className="text-xs text-muted-foreground">Balanceamento ativo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">Server-03 alta carga</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Balanceamento</CardTitle>
          <CardDescription>Algoritmo e regras de distribuição</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Algoritmo</h4>
              <Badge>Round Robin</Badge>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Health Check</h4>
              <p className="text-sm text-muted-foreground">A cada 30 segundos</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Timeout</h4>
              <p className="text-sm text-muted-foreground">5 segundos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Servidores</CardTitle>
          <CardDescription>Monitoramento em tempo real da infraestrutura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {servers.map((server) => (
              <div key={server.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Server className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">{server.name}</h4>
                    <p className="text-sm text-muted-foreground">{server.ip}</p>
                    <p className="text-xs text-muted-foreground">
                      {server.requests} requests/min
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getLoadColor(server.load)}`}>
                      {server.load}%
                    </div>
                    <Progress value={server.load} className="w-20 h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Carga</p>
                  </div>
                  <Badge variant={getStatusColor(server.status)}>
                    {server.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
