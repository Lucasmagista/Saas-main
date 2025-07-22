
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle, Activity } from "lucide-react";

export const HealthChecks = () => {
  const healthChecks = [
    { name: "Database", status: "healthy", latency: "12ms", uptime: "99.9%" },
    { name: "API Gateway", status: "healthy", latency: "8ms", uptime: "100%" },
    { name: "Redis Cache", status: "warning", latency: "45ms", uptime: "98.5%" },
    { name: "Email Service", status: "healthy", latency: "120ms", uptime: "99.8%" },
    { name: "File Storage", status: "error", latency: "timeout", uptime: "95.2%" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "error": return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "healthy": return "default";
      case "warning": return "secondary";
      case "error": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Health Checks</h2>
          <p className="text-muted-foreground">Status de saúde dos serviços</p>
        </div>
        <Button variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          Executar Verificação
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Serviços Saudáveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-muted-foreground">de 5 serviços</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">1</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
            <p className="text-xs text-muted-foreground">Intervenção necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {healthChecks.map((check) => (
          <Card key={check.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(check.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{check.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Latência: {check.latency}</span>
                      <span>Uptime: {check.uptime}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusBadge(check.status)}>
                  {check.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
