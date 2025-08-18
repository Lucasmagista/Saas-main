import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Shield, Users, Lock } from "lucide-react";
import { useRoleContext } from '@/contexts/RoleContext';
import { UserRolePanel } from "@/components/security/UserRolePanel";

export const AccessControl = () => {
  // Obter a lista de roles e funções para alterar o estado
  const { roles, toggleRoleActive } = useRoleContext();

  // Contadores derivados
  const activeRolesCount = roles.filter(r => r.active).length;
  const permissionTypesCount = Array.from(
    new Set(roles.flatMap(r => r.permissions))
  ).length;

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

      {/* Painéis de resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Em uma aplicação real, este número seria calculado a partir do backend */}
            <div className="text-2xl font-bold">--</div>
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
            <div className="text-2xl font-bold">{activeRolesCount}</div>
            <p className="text-xs text-muted-foreground">de {roles.length} roles</p>
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
            <div className="text-2xl font-bold">{permissionTypesCount}</div>
            <p className="text-xs text-muted-foreground">Tipos diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de roles */}
      <div className="space-y-4">
        {roles.map(role => (
          <Card key={role.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{role.name}</h3>
                    <Badge variant={role.active ? "default" : "outline"}>{role.name}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Permissões: {role.permissions.length > 0 ? role.permissions.join(", ") : "Nenhuma"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Switch checked={role.active} onCheckedChange={() => toggleRoleActive(role.id)} />
                  <Button size="sm" variant="outline" disabled>
                    Editar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <UserRolePanel />
      </div>
    </div>
  );
};
