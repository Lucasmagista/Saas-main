
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Layers, Zap, HardDrive, RefreshCw } from "lucide-react";

export const CachingLayers = () => {
  const cacheLayers = [
    { name: "Redis L1", type: "Memory", hitRate: 94, size: "2.8 GB", entries: 125000, ttl: "1h" },
    { name: "Memcached L2", type: "Memory", hitRate: 87, size: "1.2 GB", entries: 85000, ttl: "6h" },
    { name: "Database Cache", type: "Query", hitRate: 76, size: "450 MB", entries: 25000, ttl: "30m" },
    { name: "CDN Edge", type: "Content", hitRate: 92, size: "15.2 GB", entries: 450000, ttl: "24h" }
  ];

  const cacheOperations = [
    { operation: "Cache Warming", status: "active", schedule: "Daily 02:00", lastRun: "2024-01-20 02:00" },
    { operation: "Auto Invalidation", status: "active", schedule: "On Update", lastRun: "2024-01-20 14:30" },
    { operation: "Memory Cleanup", status: "active", schedule: "Every 4h", lastRun: "2024-01-20 16:00" },
    { operation: "Statistics Export", status: "inactive", schedule: "Weekly", lastRun: "2024-01-15 00:00" }
  ];

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 90) return "text-green-600";
    if (hitRate >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Memory": return "destructive";
      case "Query": return "secondary";
      case "Content": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Camadas de Cache</h2>
          <p className="text-muted-foreground">Gestão multinível de cache para performance</p>
        </div>
        <Button>
          <RefreshCw className="h-4 w-4 mr-2" />
          Limpar Caches
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Camadas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Todas operacionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Hit Rate Médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.3%</div>
            <p className="text-xs text-muted-foreground">Excelente performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Uso de Memória
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">19.6 GB</div>
            <p className="text-xs text-muted-foreground">de 32 GB disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Entries Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">685K</div>
            <p className="text-xs text-muted-foreground">Objetos em cache</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status das Camadas de Cache</CardTitle>
          <CardDescription>Performance detalhada por camada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cacheLayers.map((layer) => (
              <div key={layer.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Layers className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">{layer.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getTypeColor(layer.type)} className="text-xs">
                        {layer.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">TTL: {layer.ttl}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {layer.size} • {layer.entries.toLocaleString()} entries
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getHitRateColor(layer.hitRate)}`}>
                      {layer.hitRate}%
                    </div>
                    <Progress value={layer.hitRate} className="w-20 h-2" />
                    <p className="text-xs text-muted-foreground">Hit Rate</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Configurar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operações Automáticas</CardTitle>
          <CardDescription>Tarefas de manutenção e otimização</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cacheOperations.map((operation, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{operation.operation}</h4>
                  <p className="text-sm text-muted-foreground">
                    Agenda: {operation.schedule} • Última execução: {operation.lastRun}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch defaultChecked={operation.status === "active"} />
                  <Badge variant={operation.status === "active" ? "default" : "secondary"}>
                    {operation.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
