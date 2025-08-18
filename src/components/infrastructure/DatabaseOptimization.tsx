
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Database, Zap, HardDrive, TrendingUp, AlertTriangle } from "lucide-react";

export const DatabaseOptimization = () => {
  const databases = [
    { name: "Primary DB", type: "PostgreSQL", size: "45.2 GB", connections: 125, performance: 92 },
    { name: "Analytics DB", type: "MongoDB", size: "128.5 GB", connections: 45, performance: 88 },
    { name: "Cache DB", type: "Redis", size: "2.8 GB", connections: 280, performance: 98 },
    { name: "Archive DB", type: "MySQL", size: "89.3 GB", connections: 12, performance: 85 }
  ];

  const optimizations = [
    { type: "Query Optimization", status: "active", impact: "High", description: "Índices automáticos criados" },
    { type: "Connection Pooling", status: "active", impact: "Medium", description: "Pool de conexões otimizado" },
    { type: "Read Replicas", status: "active", impact: "High", description: "3 réplicas de leitura ativas" },
    { type: "Partitioning", status: "pending", impact: "High", description: "Particionamento por data" }
  ];

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600";
    if (performance >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "pending": return "secondary";
      case "error": return "destructive";
      default: return "outline";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "High": return "destructive";
      case "Medium": return "secondary";
      case "Low": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Otimização de Banco de Dados</h2>
          <p className="text-muted-foreground">Performance e otimização automática</p>
        </div>
        <Button>
          <Database className="h-4 w-4 mr-2" />
          Executar Análise
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Bancos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Todos funcionais</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Queries/seg
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,847</div>
            <p className="text-xs text-muted-foreground">Performance ótima</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Storage Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">265.8 GB</div>
            <p className="text-xs text-muted-foreground">de 500 GB disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performance Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">90.8%</div>
            <p className="text-xs text-muted-foreground">+5% este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status dos Bancos de Dados</CardTitle>
          <CardDescription>Monitoramento de performance e recursos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {databases.map((db) => (
              <div key={db.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Database className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">{db.name}</h4>
                    <p className="text-sm text-muted-foreground">{db.type}</p>
                    <p className="text-xs text-muted-foreground">
                      {db.size} • {db.connections} conexões
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPerformanceColor(db.performance)}`}>
                      {db.performance}%
                    </div>
                    <Progress value={db.performance} className="w-20 h-2" />
                    <p className="text-xs text-muted-foreground">Performance</p>
                  </div>
                  <Button size="sm" variant="outline">
                    Otimizar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Otimizações Ativas</CardTitle>
          <CardDescription>Melhorias automáticas de performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizations.map((opt, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {opt.status === "active" ? (
                      <Zap className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold">{opt.type}</h4>
                    <p className="text-sm text-muted-foreground">{opt.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getImpactColor(opt.impact)}>
                    {opt.impact} Impact
                  </Badge>
                  <Badge variant={getStatusColor(opt.status)}>
                    {opt.status}
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
