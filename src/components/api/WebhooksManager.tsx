
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings, Trash2, Play, Pause } from "lucide-react";

export const WebhooksManager = () => {
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "User Created", url: "https://api.example.com/webhook/user", status: "active", events: ["user.created"], lastTriggered: "2024-01-20 10:30:15" },
    { id: 2, name: "Payment Success", url: "https://payments.example.com/webhook", status: "active", events: ["payment.success", "payment.failed"], lastTriggered: "2024-01-20 09:15:30" },
    { id: 3, name: "Order Update", url: "https://orders.example.com/webhook", status: "inactive", events: ["order.updated"], lastTriggered: "2024-01-19 15:45:22" }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Webhooks</h2>
          <p className="text-muted-foreground">Configure e monitore webhooks para eventos do sistema</p>
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
              <DialogTitle>Criar Novo Webhook</DialogTitle>
              <DialogDescription>Configure um novo webhook para receber eventos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input id="name" placeholder="Nome do webhook" />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" placeholder="https://api.example.com/webhook" />
              </div>
              <div>
                <Label htmlFor="events">Eventos</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione os eventos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user.created">Usuário Criado</SelectItem>
                    <SelectItem value="user.updated">Usuário Atualizado</SelectItem>
                    <SelectItem value="payment.success">Pagamento Sucesso</SelectItem>
                    <SelectItem value="payment.failed">Pagamento Falhou</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Criar Webhook</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{webhook.name}</CardTitle>
                  <CardDescription>{webhook.url}</CardDescription>
                </div>
                <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                  {webhook.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <div className="flex gap-2">
                    {webhook.events.map((event) => (
                      <Badge key={event} variant="outline">{event}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Último disparo: {webhook.lastTriggered}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    {webhook.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
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
