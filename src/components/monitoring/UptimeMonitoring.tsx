
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Globe, CheckCircle, XCircle } from "lucide-react";

export const UptimeMonitoring = () => {
  const services = [
    { name: "Main Website", url: "https://app.example.com", status: "up", uptime: "99.98%", response: "145ms" },
    { name: "API Endpoint", url: "https://api.example.com", status: "up", uptime: "99.95%", response: "89ms" },
    { name: "CDN", url: "https://cdn.example.com", status: "down", uptime: "98.12%", response: "timeout" },
    { name: "Admin Panel", url: "https://admin.example.com", status: "up", uptime: "99.89%", response: "234ms" }
  ];

  const getStatusIcon = (status: string) => {
    return status === "up" 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (status: string): "default" | "destructive" => {
    return status === "up" ? "default" : "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitoramento de Uptime</h2>
          <p className="text-muted-foreground">Status de disponibilidade dos serviços</p>
        </div>
        <Button variant="outline">
          <Globe className="h-4 w-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Serviços Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">3</div>
            <p className="text-xs text-muted-foreground">de 4 serviços</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime Geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.74%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Inatividade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.2h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Resposta Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156ms</div>
            <p className="text-xs text-muted-foreground">Tempo médio</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {services.map((service) => (
          <Card key={service.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(service.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.url}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Uptime: {service.uptime}</span>
                      <span>Resposta: {service.response}</span>
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusBadge(service.status)}>
                  {service.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
