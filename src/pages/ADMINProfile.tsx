import { useEffect } from "react";
import { 
  useAdminDashboard, 
  useAdminUsers, 
  useAdminAuditLogs, 
  useAdminSecurityAlerts,
  useAdminNotifications 
} from "@/hooks/useAdminDashboard";
import { SystemStatusCards } from "@/components/admin/SystemStatusCards";
import { UserManagementPanel } from "@/components/admin/UserManagementPanel";
import { AuditLogsPanel } from "@/components/admin/AuditLogsPanel";
import { SecurityAlertsNotifications } from "@/components/admin/SecurityAlertsNotifications";
import { AdminQuickActions } from "@/components/admin/AdminQuickActions";
import { RolePermissionsManagement } from "@/components/admin/RolePermissionsManagement";
import DatabaseManagement from "@/components/admin/DatabaseManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, Crown, TrendingUp, Shield, Settings, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ADMINProfile = () => {
  const { toast } = useToast();
  
  // Hooks para dados do dashboard
  const { systemStatus, statusLoading } = useAdminDashboard();
  const { users, usersLoading, updateUser, blockUser, unblockUser } = useAdminUsers();
  const { auditLogs, logsLoading } = useAdminAuditLogs(100);
  const { securityAlerts, alertsLoading, resolveAlert } = useAdminSecurityAlerts();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();

  useEffect(() => {
    document.title = "Painel do Administrador | SaasPro";
  }, []);

  const handleRefreshData = () => {
    toast({
      title: "Atualizando dados...",
      description: "Os dados do dashboard estão sendo atualizados.",
    });
    // Aqui você poderia invalidar queries do React Query para forçar refresh
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-purple-600 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Painel do Administrador
                  </h1>
                  <p className="text-sm text-gray-600">
                    Controle total do sistema SaasPro
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <Badge variant="destructive">
                    {unreadCount} notificações
                  </Badge>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRefreshData}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissões
            </TabsTrigger>
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Database
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Sistema
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-8">
            {/* System Status Overview */}
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Status do Sistema
                </h2>
                <p className="text-sm text-gray-600">
                  Monitoramento em tempo real dos recursos e performance
                </p>
              </div>
              <SystemStatusCards status={systemStatus} loading={statusLoading} />
            </section>

            <Separator />

            {/* Quick Actions */}
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Ações Administrativas
                </h2>
                <p className="text-sm text-gray-600">
                  Ferramentas e ações rápidas para administração do sistema
                </p>
              </div>
              <AdminQuickActions />
            </section>
          </TabsContent>

          {/* Gerenciamento de Usuários */}
          <TabsContent value="users" className="space-y-8">
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Gerenciamento de Usuários
                </h2>
                <p className="text-sm text-gray-600">
                  Controle completo sobre usuários, roles e permissões
                </p>
              </div>
              <UserManagementPanel
                users={users}
                loading={usersLoading}
                onUpdateUser={updateUser}
                onBlockUser={blockUser}
                onUnblockUser={unblockUser}
              />
            </section>
          </TabsContent>

          {/* Sistema de Permissões */}
          <TabsContent value="permissions" className="space-y-8">
            <RolePermissionsManagement />
          </TabsContent>

          {/* Gerenciamento de Banco de Dados */}
          <TabsContent value="database" className="space-y-8">
            <DatabaseManagement />
          </TabsContent>

          {/* Segurança */}
          <TabsContent value="security" className="space-y-8">
            {/* Security Alerts & Notifications */}
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Segurança & Notificações
                </h2>
                <p className="text-sm text-gray-600">
                  Alertas de segurança e notificações administrativas
                </p>
              </div>
              <SecurityAlertsNotifications
                securityAlerts={securityAlerts}
                notifications={notifications}
                alertsLoading={alertsLoading}
                onResolveAlert={resolveAlert}
                onMarkNotificationAsRead={markAsRead}
                onMarkAllNotificationsAsRead={markAllAsRead}
              />
            </section>

            <Separator />

            {/* Audit Logs */}
            <section>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Logs de Auditoria
                </h2>
                <p className="text-sm text-gray-600">
                  Histórico completo de todas as ações realizadas no sistema
                </p>
              </div>
              <AuditLogsPanel auditLogs={auditLogs} loading={logsLoading} />
            </section>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system" className="space-y-8">
            {/* Admin Guidelines */}
            <section>
              <Card>
                <CardHeader>
                  <CardTitle>Diretrizes de Segurança para Administradores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Boas Práticas</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Utilize autenticação de dois fatores</li>
                        <li>• Revise permissões de usuários regularmente</li>
                        <li>• Monitore logs de auditoria diariamente</li>
                        <li>• Mantenha backups atualizados</li>
                        <li>• Use senhas fortes e únicas</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Responsabilidades</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Gerenciar configurações do sistema</li>
                        <li>• Controlar acesso e permissões</li>
                        <li>• Monitorar segurança continuamente</li>
                        <li>• Realizar manutenções preventivas</li>
                        <li>• Responder a incidentes de segurança</li>
                      </ul>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Crown className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">
                          Acesso Privilegiado
                        </h4>
                        <p className="text-sm text-blue-800">
                          Como administrador, você tem acesso completo ao sistema. Use esses 
                          privilégios com responsabilidade e sempre seguindo as diretrizes 
                          de segurança estabelecidas.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ADMINProfile;
