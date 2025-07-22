
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Building, Users, Database, Shield, Settings } from "lucide-react";

export const MultiTenancy = () => {
  const tenants = [
    { id: 1, name: "Tech Corp", domain: "techcorp.app.com", users: 250, storage: 15.2, plan: "Enterprise", status: "active" },
    { id: 2, name: "StartUp Inc", domain: "startup.app.com", users: 45, storage: 2.8, plan: "Pro", status: "active" },
    { id: 3, name: "Digital Ltd", domain: "digital.app.com", users: 120, storage: 8.5, plan: "Business", status: "suspended" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "suspended": return "destructive";
      case "inactive": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Multi-Tenancy</h2>
          <p className="text-muted-foreground">Gestão de inquilinos e isolamento de dados</p>
        </div>
        <Button>
          <Building className="h-4 w-4 mr-2" />
          Novo Inquilino
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Total de Inquilinos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+3 este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Uso de Storage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156 GB</div>
            <p className="text-xs text-muted-foreground">de 500 GB disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Isolamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">Dados isolados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configurações Globais</CardTitle>
          <CardDescription>Configurações aplicadas a todos os inquilinos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Isolamento de Dados</h4>
              <p className="text-sm text-muted-foreground">Separação completa por tenant</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Subdomínios Personalizados</h4>
              <p className="text-sm text-muted-foreground">Permite domínios customizados</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">White Label</h4>
              <p className="text-sm text-muted-foreground">Personalização completa da marca</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inquilinos Ativos</CardTitle>
          <CardDescription>Lista de todos os inquilinos no sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Building className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h4 className="font-semibold">{tenant.name}</h4>
                    <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {tenant.users} usuários
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {tenant.storage} GB storage
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{tenant.plan}</Badge>
                  <Badge variant={getStatusColor(tenant.status)}>
                    {tenant.status}
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
    </div>
  );
};
