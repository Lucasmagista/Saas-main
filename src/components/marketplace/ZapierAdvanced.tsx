
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Plus, Settings, Activity, ArrowRight } from "lucide-react";

export const ZapierAdvanced = () => {
  const zaps = [
    { 
      id: 1, 
      name: "New User → Slack Notification", 
      trigger: "New User Registration", 
      action: "Send Slack Message", 
      status: "active", 
      runs: 127,
      successRate: 98.4
    },
    { 
      id: 2, 
      name: "Payment → Google Sheets", 
      trigger: "Successful Payment", 
      action: "Add Row to Sheet", 
      status: "active", 
      runs: 89,
      successRate: 96.6
    },
    { 
      id: 3, 
      name: "Support Ticket → Email", 
      trigger: "New Support Ticket", 
      action: "Send Email Alert", 
      status: "paused", 
      runs: 45,
      successRate: 100
    },
    { 
      id: 4, 
      name: "Order → Discord", 
      trigger: "New Order", 
      action: "Post to Discord", 
      status: "active", 
      runs: 203,
      successRate: 94.1
    }
  ];

  const integrationOptions = [
    { name: "Gmail", category: "Email", available: true },
    { name: "Google Sheets", category: "Spreadsheets", available: true },
    { name: "Slack", category: "Communication", available: true },
    { name: "Discord", category: "Communication", available: true },
    { name: "Trello", category: "Project Management", available: true },
    { name: "Airtable", category: "Database", available: false }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "paused": return "secondary";
      case "error": return "destructive";
      default: return "outline";
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 95) return "text-green-600";
    if (rate >= 90) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Zapier Avançado</h2>
          <p className="text-muted-foreground">Automações avançadas com Zapier</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Criar Zap
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Zaps Ativos
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
              Execuções Hoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">464</div>
            <p className="text-xs text-muted-foreground">+15% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">97.3%</div>
            <p className="text-xs text-muted-foreground">Média geral</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tempo Economizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24h</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zaps Configurados</CardTitle>
          <CardDescription>Automações ativas e suas métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {zaps.map((zap) => (
              <div key={zap.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Zap className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">{zap.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{zap.trigger}</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{zap.action}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {zap.runs} execuções
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getSuccessRateColor(zap.successRate)}`}>
                      {zap.successRate}%
                    </div>
                    <Progress value={zap.successRate} className="w-20 h-2" />
                    <p className="text-xs text-muted-foreground">Sucesso</p>
                  </div>
                  <Badge variant={getStatusColor(zap.status)}>
                    {zap.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integrações Disponíveis</CardTitle>
          <CardDescription>Conecte com centenas de aplicativos via Zapier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrationOptions.map((option) => (
              <div key={option.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{option.name}</h4>
                  <p className="text-sm text-muted-foreground">{option.category}</p>
                </div>
                {option.available ? (
                  <Badge variant="default">Disponível</Badge>
                ) : (
                  <Badge variant="outline">Em Breve</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
