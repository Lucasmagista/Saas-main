
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HardDrive, Download, Calendar } from "lucide-react";

export const BackupManager = () => {
  const backups = [
    { id: 1, name: "Backup Completo", date: "2024-01-20", size: "2.5 GB", status: "completed" },
    { id: 2, name: "Backup Incremental", date: "2024-01-19", size: "245 MB", status: "completed" },
    { id: 3, name: "Backup Manual", date: "2024-01-18", size: "1.2 GB", status: "in_progress" },
    { id: 4, name: "Backup Automático", date: "2024-01-17", size: "1.8 GB", status: "completed" }
  ];

  const getStatusBadge = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "secondary";
      case "failed": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Backup</h2>
          <p className="text-muted-foreground">Configurar e monitorar backups</p>
        </div>
        <Button>
          <HardDrive className="h-4 w-4 mr-2" />
          Novo Backup
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Último Backup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2h atrás</div>
            <p className="text-xs text-muted-foreground">Backup automático</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Espaço Usado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5 GB</div>
            <p className="text-xs text-muted-foreground">de 50 GB disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Frequência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Diário</div>
            <p className="text-xs text-muted-foreground">Backup automático</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {backups.map((backup) => (
          <Card key={backup.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{backup.name}</h3>
                    <Badge variant={getStatusBadge(backup.status)}>
                      {backup.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {backup.date}
                    </div>
                    <span>Tamanho: {backup.size}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm">Restaurar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
