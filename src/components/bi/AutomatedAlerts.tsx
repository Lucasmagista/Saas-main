
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Plus, Settings, Trash2, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export const AutomatedAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: "Vendas Baixas",
      description: "Alerta quando vendas diárias ficam abaixo de R$ 10.000",
      condition: "sales < 10000",
      frequency: "daily",
      channels: ["email", "slack"],
      isActive: true,
      lastTriggered: "2024-01-19 14:30",
      triggerCount: 3
    },
    {
      id: 2,
      name: "Alto Tráfego",
      description: "Notifica quando visitantes únicos excedem 1000/hora",
      condition: "unique_visitors > 1000",
      frequency: "hourly",
      channels: ["email", "sms"],
      isActive: true,
      lastTriggered: "2024-01-20 09:15",
      triggerCount: 12
    },
    {
      id: 3,
      name: "Taxa de Conversão Baixa",
      description: "Alerta quando conversão fica abaixo de 2%",
      condition: "conversion_rate < 0.02",
      frequency: "daily",
      channels: ["email"],
      isActive: false,
      lastTriggered: "2024-01-18 10:45",
      triggerCount: 1
    }
  ]);

  const recentTriggers = [
    { id: 1, alertName: "Vendas Baixas", message: "Vendas diárias: R$ 8.500 (abaixo do limite)", time: "2024-01-20 10:30", severity: "warning" },
    { id: 2, alertName: "Alto Tráfego", message: "1.250 visitantes únicos na última hora", time: "2024-01-20 09:15", severity: "info" },
    { id: 3, alertName: "Sistema Lento", message: "Tempo de resposta médio: 3.2s", time: "2024-01-20 08:45", severity: "critical" }
  ];

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning": return <TrendingDown className="h-4 w-4 text-yellow-500" />;
      case "info": return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "warning": return "secondary";
      case "info": return "default";
      default: return "outline";
    }
  };

  const toggleAlert = (id: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Alertas Automatizados</h2>
          <p className="text-muted-foreground">Configure alertas inteligentes baseados em métricas</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Alerta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Alerta</DialogTitle>
              <DialogDescription>Configure um alerta automatizado baseado em métricas</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="alert-name">Nome do Alerta</Label>
                <Input id="alert-name" placeholder="Nome do alerta" />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea id="description" placeholder="Descreva quando este alerta deve ser disparado" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metric">Métrica</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a métrica" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Vendas</SelectItem>
                      <SelectItem value="visitors">Visitantes</SelectItem>
                      <SelectItem value="conversion">Taxa de Conversão</SelectItem>
                      <SelectItem value="revenue">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="condition">Condição</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Condição" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater">Maior que</SelectItem>
                      <SelectItem value="less">Menor que</SelectItem>
                      <SelectItem value="equal">Igual a</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="threshold">Valor Limite</Label>
                <Input id="threshold" type="number" placeholder="Digite o valor" />
              </div>
              <div>
                <Label htmlFor="frequency">Frequência</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Frequência de verificação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Tempo Real</SelectItem>
                    <SelectItem value="hourly">A cada hora</SelectItem>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Criar Alerta</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Alertas Configurados</CardTitle>
              <CardDescription>Gerencie seus alertas automatizados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{alert.name}</h4>
                        <Badge variant={alert.isActive ? "default" : "secondary"}>
                          {alert.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Disparado {alert.triggerCount}x</span>
                        <span>Último: {alert.lastTriggered}</span>
                        <span>Canais: {alert.channels.join(", ")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alert.isActive}
                        onCheckedChange={() => toggleAlert(alert.id)}
                      />
                      <Button size="sm" variant="outline">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Alertas Recentes</CardTitle>
              <CardDescription>Últimos alertas disparados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTriggers.map((trigger) => (
                  <div key={trigger.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getSeverityIcon(trigger.severity)}
                    <div className="flex-1">
                      <h5 className="font-medium text-sm">{trigger.alertName}</h5>
                      <p className="text-xs text-muted-foreground">{trigger.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{trigger.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
