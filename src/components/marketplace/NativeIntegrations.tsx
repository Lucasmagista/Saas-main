
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Link2, Settings, CheckCircle, AlertCircle } from "lucide-react";

export const NativeIntegrations = () => {
  const integrations = [
    { name: "Slack", description: "Notificações e alertas automáticos", status: "connected", category: "Communication", users: 245 },
    { name: "Google Workspace", description: "SSO e sincronização de usuários", status: "connected", category: "Productivity", users: 189 },
    { name: "Stripe", description: "Processamento de pagamentos", status: "connected", category: "Payments", users: 156 },
    { name: "Salesforce", description: "Sincronização de CRM", status: "disconnected", category: "CRM", users: 0 },
    { name: "Microsoft 365", description: "Integração com Office", status: "pending", category: "Productivity", users: 89 },
    { name: "Zapier", description: "Automações personalizadas", status: "connected", category: "Automation", users: 67 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "connected": return "default";
      case "pending": return "secondary";
      default: return "outline";
    }
  };

  const getCategoryColor = (category: string): "default" | "secondary" | "outline" | "destructive" => {
    switch (category) {
      case "Communication": return "default";
      case "Productivity": return "secondary";
      case "Payments": return "destructive";
      case "CRM": return "outline";
      case "Automation": return "default";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Integrações Nativas</h2>
          <p className="text-muted-foreground">Conecte com ferramentas populares</p>
        </div>
        <Button>
          <Link2 className="h-4 w-4 mr-2" />
          Explorar Mais
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Integrações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">de 6 configuradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Usuários Conectados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">746</div>
            <p className="text-xs text-muted-foreground">Across all integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sincronizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Última 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">99.9%</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {integrations.map((integration) => (
          <Card key={integration.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(integration.status)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{integration.name}</h3>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={getCategoryColor(integration.category)}>
                        {integration.category}
                      </Badge>
                      {integration.users > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {integration.users} usuários conectados
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch defaultChecked={integration.status === "connected"} />
                    <Badge variant={getStatusColor(integration.status)}>
                      {integration.status}
                    </Badge>
                  </div>
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
