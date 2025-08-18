
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const RateLimiting = () => {
  const { toast } = useToast();
  const [globalLimit, setGlobalLimit] = useState("1000");
  const [perUserLimit, setPerUserLimit] = useState("100");
  const [timeWindow, setTimeWindow] = useState("hour");
  const [enabled, setEnabled] = useState(true);
  const [burstAllowed, setBurstAllowed] = useState(true);

  const currentUsage = [
    {
      endpoint: '/api/v1/users',
      limit: 1000,
      used: 847,
      percentage: 84.7,
      status: 'warning'
    },
    {
      endpoint: '/api/v1/projects',
      limit: 500,
      used: 234,
      percentage: 46.8,
      status: 'normal'
    },
    {
      endpoint: '/api/v1/analytics',
      limit: 200,
      used: 189,
      percentage: 94.5,
      status: 'critical'
    },
    {
      endpoint: '/api/v1/webhooks',
      limit: 100,
      used: 12,
      percentage: 12,
      status: 'normal'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Normal</Badge>;
    }
  };

  const handleSaveSettings = () => {
    toast({
      title: "Configurações salvas",
      description: "Os limites de rate limiting foram atualizados.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Configurações de Rate Limiting
          </CardTitle>
          <CardDescription>
            Configure limites globais e por usuário para proteger sua API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Rate Limiting Ativo</Label>
              <p className="text-sm text-muted-foreground">
                Ativar/desativar controle de limite de requisições
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="global-limit">Limite Global</Label>
                  <Input
                    id="global-limit"
                    value={globalLimit}
                    onChange={(e) => setGlobalLimit(e.target.value)}
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Requests por janela de tempo
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user-limit">Limite por Usuário</Label>
                  <Input
                    id="user-limit"
                    value={perUserLimit}
                    onChange={(e) => setPerUserLimit(e.target.value)}
                    placeholder="100"
                  />
                  <p className="text-xs text-muted-foreground">
                    Requests por usuário
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time-window">Janela de Tempo</Label>
                  <Select value={timeWindow} onValueChange={setTimeWindow}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minute">Por Minuto</SelectItem>
                      <SelectItem value="hour">Por Hora</SelectItem>
                      <SelectItem value="day">Por Dia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Permitir Burst</Label>
                  <p className="text-sm text-muted-foreground">
                    Permitir picos temporários acima do limite
                  </p>
                </div>
                <Switch checked={burstAllowed} onCheckedChange={setBurstAllowed} />
              </div>
            </>
          )}

          <Button onClick={handleSaveSettings} disabled={!enabled}>
            Salvar Configurações
          </Button>
        </CardContent>
      </Card>

      {/* Uso Atual por Endpoint */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Uso Atual por Endpoint
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real dos limites de requisições
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUsage.map((endpoint, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {endpoint.endpoint}
                  </code>
                  {getStatusBadge(endpoint.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {endpoint.used}/{endpoint.limit} requests
                </div>
              </div>
              <Progress 
                value={endpoint.percentage} 
                className={`h-2 ${getStatusColor(endpoint.status)}`}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{endpoint.percentage.toFixed(1)}% utilizado</span>
                <span>{endpoint.limit - endpoint.used} disponíveis</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Alertas de Rate Limit
          </CardTitle>
          <CardDescription>
            Configurações de alertas quando limites são atingidos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alert-threshold">Limite de Alerta (%)</Label>
              <Input
                id="alert-threshold"
                defaultValue="80"
                placeholder="80"
              />
              <p className="text-xs text-muted-foreground">
                Enviar alerta quando atingir esta porcentagem
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cooldown">Cooldown (minutos)</Label>
              <Input
                id="cooldown"
                defaultValue="15"
                placeholder="15"
              />
              <p className="text-xs text-muted-foreground">
                Tempo de espera entre alertas
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Email Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Enviar alertas por email
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Webhook Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Enviar alertas via webhook
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Resumidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Requests/Hora</p>
                <p className="text-2xl font-bold">1,282</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bloqueados/Hora</p>
                <p className="text-2xl font-bold">47</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Bloqueio</p>
                <p className="text-2xl font-bold">3.7%</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Únicos</p>
                <p className="text-2xl font-bold">156</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
