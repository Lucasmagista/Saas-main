
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Users, Lock } from "lucide-react";

export const AccessControl = () => {
  const permissions = [
    { id: 1, role: "Admin", users: 3, permissions: ["read", "write", "delete", "manage"], active: true },
    { id: 2, role: "Editor", users: 12, permissions: ["read", "write"], active: true },
    { id: 3, role: "Viewer", users: 45, permissions: ["read"], active: true },
    { id: 4, role: "Guest", users: 0, permissions: [], active: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Controle de Acesso</h2>
          <p className="text-muted-foreground">Gerenciar permissões e roles</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Nova Role
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60</div>
            <p className="text-xs text-muted-foreground">Usuários ativos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Roles Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">de 4 roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Permissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">Tipos diferentes</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {permissions.map((permission) => (
          <Card key={permission.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{permission.role}</h3>
                    <Badge variant={permission.active ? "default" : "outline"}>
                      {permission.active ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{permission.users} usuários</span>
                    <span>Permissões: {permission.permissions.join(", ") || "Nenhuma"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Switch defaultChecked={permission.active} />
                  <Button size="sm" variant="outline">
                    Editar
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
