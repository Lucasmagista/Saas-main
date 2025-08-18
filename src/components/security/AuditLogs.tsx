
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Filter } from "lucide-react";

export const AuditLogs = () => {
  const logs = [
    { id: 1, action: "User login", user: "john@example.com", timestamp: "2024-01-20 14:30", status: "success", ip: "192.168.1.1" },
    { id: 2, action: "Data export", user: "admin@example.com", timestamp: "2024-01-20 13:15", status: "success", ip: "192.168.1.2" },
    { id: 3, action: "Failed login attempt", user: "unknown", timestamp: "2024-01-20 12:45", status: "failed", ip: "192.168.1.3" },
    { id: 4, action: "Password change", user: "user@example.com", timestamp: "2024-01-20 11:20", status: "success", ip: "192.168.1.4" }
  ];

  const getStatusBadge = (status: string): "default" | "destructive" => {
    return status === "success" ? "default" : "destructive";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Logs de Auditoria</h2>
          <p className="text-muted-foreground">Registro de atividades do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Segurança</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">Requer atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Logins Falhados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Últimas 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">IPs Únicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Acessos únicos</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{log.action}</h3>
                    <Badge variant={getStatusBadge(log.status)}>
                      {log.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Usuário: {log.user}</span>
                    <span>IP: {log.ip}</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
