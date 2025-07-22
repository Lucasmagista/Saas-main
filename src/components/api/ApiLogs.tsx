
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Filter } from "lucide-react";

export const ApiLogs = () => {
  const [filter, setFilter] = useState("all");

  const logs = [
    { id: 1, method: "GET", endpoint: "/api/users", status: 200, time: "2024-01-20 10:30:15", responseTime: "120ms", ip: "192.168.1.1" },
    { id: 2, method: "POST", endpoint: "/api/users", status: 201, time: "2024-01-20 10:28:45", responseTime: "250ms", ip: "192.168.1.2" },
    { id: 3, method: "GET", endpoint: "/api/users/123", status: 404, time: "2024-01-20 10:25:30", responseTime: "80ms", ip: "192.168.1.3" },
    { id: 4, method: "PUT", endpoint: "/api/users/456", status: 500, time: "2024-01-20 10:20:12", responseTime: "1.2s", ip: "192.168.1.4" }
  ];

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "default";
    if (status >= 400 && status < 500) return "destructive";
    if (status >= 500) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Logs da API</h2>
          <p className="text-muted-foreground">Monitore todas as requisições da API em tempo real</p>
        </div>
        <Button>
          <Download className="h-4 w-4 mr-2" />
          Exportar Logs
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar logs..." className="pl-10" />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="success">Sucesso (2xx)</SelectItem>
            <SelectItem value="error">Erro (4xx/5xx)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      <div className="space-y-2">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline">{log.method}</Badge>
                  <code className="text-sm">{log.endpoint}</code>
                  <Badge variant={getStatusColor(log.status)}>{log.status}</Badge>
                  <span className="text-sm text-muted-foreground">{log.responseTime}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{log.ip}</span>
                  <span>{log.time}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
