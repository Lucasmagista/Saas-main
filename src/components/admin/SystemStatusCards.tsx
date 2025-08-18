import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Users, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Server,
  HardDrive,
  Cpu,
  Database
} from 'lucide-react';
import { SystemStatus } from '@/hooks/useAdminDashboard';

interface SystemStatusCardsProps {
  status: SystemStatus | undefined;
  loading: boolean;
}

// Helper function to get usage colors
const getUsageColors = (usage: number) => {
  if (usage > 80) {
    return { color: 'text-red-600', bgColor: 'bg-red-50' };
  }
  if (usage > 60) {
    return { color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  }
  return { color: 'text-green-600', bgColor: 'bg-green-50' };
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <Card key={`skeleton-${i + 1}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const SystemStatusCards: React.FC<SystemStatusCardsProps> = ({ status, loading }) => {
  if (loading) {
    return <LoadingSkeleton />;
  }

  if (!status) return null;

  const cpuColors = getUsageColors(status.cpuUsage);
  const memoryColors = getUsageColors(status.memoryUsage);
  const diskColors = getUsageColors(status.diskUsage);

  const cards = [
    {
      id: 'users',
      title: 'Total de Usuários',
      value: status.totalUsers,
      description: `${status.activeUsers} ativos, ${status.inactiveUsers} inativos`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'sessions',
      title: 'Sessões Ativas',
      value: status.activeSessions,
      description: `de ${status.totalSessions} total`,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'errors',
      title: 'Erros do Sistema',
      value: status.systemErrors,
      description: 'Últimas 24 horas',
      icon: AlertTriangle,
      color: status.systemErrors > 0 ? 'text-red-600' : 'text-green-600',
      bgColor: status.systemErrors > 0 ? 'bg-red-50' : 'bg-green-50',
    },
    {
      id: 'uptime',
      title: 'Uptime',
      value: status.uptime,
      description: 'Disponibilidade',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      id: 'cpu',
      title: 'Uso de CPU',
      value: `${status.cpuUsage}%`,
      description: 'Processamento',
      icon: Cpu,
      color: cpuColors.color,
      bgColor: cpuColors.bgColor,
    },
    {
      id: 'memory',
      title: 'Uso de Memória',
      value: `${status.memoryUsage}%`,
      description: 'RAM utilizada',
      icon: Server,
      color: memoryColors.color,
      bgColor: memoryColors.bgColor,
    },
    {
      id: 'disk',
      title: 'Uso de Disco',
      value: `${status.diskUsage}%`,
      description: 'Armazenamento',
      icon: HardDrive,
      color: diskColors.color,
      bgColor: diskColors.bgColor,
    },
    {
      id: 'backup',
      title: 'Último Backup',
      value: new Date(status.lastBackup).toLocaleTimeString('pt-BR'),
      description: new Date(status.lastBackup).toLocaleDateString('pt-BR'),
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card key={card.id} className={card.bgColor}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {card.title}
              </CardTitle>
              <IconComponent className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.color}`}>
                {card.value}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
