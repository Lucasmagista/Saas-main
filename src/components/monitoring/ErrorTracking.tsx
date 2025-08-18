
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bug, XCircle } from "lucide-react";

export const ErrorTracking = () => {
  const errors = [
    {
      id: 1,
      message: "Database connection timeout",
      type: "critical",
      count: 12,
      lastSeen: "2 min ago",
      status: "open"
    },
    {
      id: 2,
      message: "API rate limit exceeded",
      type: "warning",
      count: 45,
      lastSeen: "5 min ago",
      status: "investigating"
    },
    {
      id: 3,
      message: "File upload validation failed",
      type: "error",
      count: 8,
      lastSeen: "1 hour ago",
      status: "resolved"
    }
  ];

  const getTypeColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case "critical": return "destructive";
      case "error": return "secondary";
      case "warning": return "outline";
      default: return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rastreamento de Erros</h2>
          <p className="text-muted-foreground">Monitoramento e análise de erros</p>
        </div>
        <Button variant="outline">
          <Bug className="h-4 w-4 mr-2" />
          Ver Todos
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Erros Críticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Avisos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">15</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.05%</div>
            <p className="text-xs text-muted-foreground">Das requisições</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {errors.map((error) => (
          <Card key={error.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{error.message}</h3>
                    <Badge variant={getTypeColor(error.type)}>
                      {error.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{error.count} ocorrências</span>
                    <span>Último: {error.lastSeen}</span>
                    <span>Status: {error.status}</span>
                  </div>
                </div>
                <Button size="sm">Investigar</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
