
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Eye, Trash2 } from "lucide-react";

export const InAppNotifications = () => {
  const notifications = [
    { id: 1, title: "Nova mensagem recebida", type: "message", read: false, time: "2 min ago" },
    { id: 2, title: "Backup concluído com sucesso", type: "system", read: true, time: "1 hour ago" },
    { id: 3, title: "Pagamento processado", type: "payment", read: false, time: "3 hours ago" },
    { id: 4, title: "Atualização disponível", type: "update", read: true, time: "1 day ago" }
  ];

  const getTypeColor = (type: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (type) {
      case "message": return "default";
      case "system": return "secondary";
      case "payment": return "destructive";
      case "update": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notificações In-App</h2>
          <p className="text-muted-foreground">Gerenciar notificações dentro do app</p>
        </div>
        <Button variant="outline">
          <Bell className="h-4 w-4 mr-2" />
          Marcar Todas como Lidas
        </Button>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className={!notification.read ? "border-primary/50" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${!notification.read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div>
                    <h4 className="font-semibold">{notification.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={getTypeColor(notification.type)}>
                        {notification.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
