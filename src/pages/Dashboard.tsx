
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';

const Dashboard = () => {
  const { profile } = useAuth();
  const { notifications, unreadCount } = useRealTimeNotifications();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Bem-vindo, {profile?.full_name || 'Usuário'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Aqui está um resumo das suas atividades hoje
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <span className="text-sm text-muted-foreground">
                {unreadCount} notificações não lidas
              </span>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <DashboardMetrics />

        {/* Grid layout for charts and activities */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <RecentActivities />
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <button className="w-full p-3 text-left bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                  <div className="font-medium">Criar Novo Lead</div>
                  <div className="text-sm text-muted-foreground">Adicionar um novo contato</div>
                </button>
                <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                  <div className="font-medium">Nova Oportunidade</div>
                  <div className="text-sm text-muted-foreground">Criar uma nova oportunidade</div>
                </button>
                <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                  <div className="font-medium">Enviar Mensagem</div>
                  <div className="text-sm text-muted-foreground">Comunicar com leads</div>
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notificações Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{notification.title}</div>
                      <div className="text-xs text-muted-foreground">{notification.message}</div>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma notificação recente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
