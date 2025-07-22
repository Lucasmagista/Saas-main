
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Webhook, Plus, Settings, Activity } from "lucide-react";

export const CustomWebhooks = () => {
  const webhooks = [
    { id: 1, name: "User Registration", url: "https://api.example.com/user-created", event: "user.created", status: "active", lastTriggered: "2024-01-20 14:30" },
    { id: 2, name: "Payment Processed", url: "https://api.example.com/payment", event: "payment.completed", status: "active", lastTriggered: "2024-01-20 12:15" },
    { id: 3, name: "Order Status", url: "https://api.example.com/order-update", event: "order.updated", status: "inactive", lastTriggered: "2024-01-19 16:45" },
    { id: 4, name: "System Alert", url: "https://api.example.com/alerts", event: "system.error", status: "active", lastTriggered: "Never" }
  ];

  const events = [
    "user.created", "user.updated", "user.deleted",
    "payment.completed", "payment.failed",
    "order.created", "order.updated", "order.cancelled",
    "system.error", "system.maintenance"
  ];

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Custom Webhooks</h2>
          <p className="text-muted-foreground">Configure notificações HTTP personalizadas</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Webhook</DialogTitle>
              <DialogDescription>Configure um novo webhook personalizado</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="webhook-name">Nome</Label>
                <Input id="webhook-name" placeholder="Nome do webhook" />
              </div>
              <div>
                <Label htmlFor="webhook-url">URL do Endpoint</Label>
                <Input id="webhook-url" placeholder="https://api.example.com/webhook" />
              </div>
              <div>
                <Label htmlFor="webhook-event">Evento</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Criar Webhook</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">de 4 configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Disparos Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">847</div>
            <p className="text-xs text-muted-foreground">+12% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">Últimos 7 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245ms</div>
            <p className="text-xs text-muted-foreground">Resposta do endpoint</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{webhook.name}</h3>
                    <Badge variant={getStatusColor(webhook.status)}>
                      {webhook.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{webhook.url}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Evento: {webhook.event}</span>
                    <span>Último disparo: {webhook.lastTriggered}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Testar
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
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
