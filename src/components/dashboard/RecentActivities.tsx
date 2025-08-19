
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { makeAuthenticatedRequest } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  user?: {
    full_name: string;
    avatar_url: string;
  };
}

export const RecentActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchActivities = async () => {
      try {
        const data = await makeAuthenticatedRequest('/api/activities?limit=10', 'GET');
        
        if (!data || !Array.isArray(data)) {
          console.error('Error fetching activities: invalid data');
          return;
        }

        setActivities(data || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Polling para simular real-time (substitui Supabase real-time)
    const interval = setInterval(() => {
      fetchActivities();
    }, 30000); // Atualiza a cada 30 segundos

    return () => {
      clearInterval(interval);
    };
  }, [user]);

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'lead_created':
        return 'bg-blue-100 text-blue-800';
      case 'opportunity_created':
        return 'bg-green-100 text-green-800';
      case 'lead_updated':
        return 'bg-yellow-100 text-yellow-800';
      case 'call_made':
        return 'bg-purple-100 text-purple-800';
      case 'email_sent':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lead_created':
        return '👤';
      case 'opportunity_created':
        return '💼';
      case 'lead_updated':
        return '📝';
      case 'call_made':
        return '📞';
      case 'email_sent':
        return '📧';
      default:
        return '📋';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Atividades Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <p className="text-sm text-muted-foreground">Últimas ações do sistema</p>
          </div>
          <Badge variant="secondary">{activities.length} atividades</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nenhuma atividade recente encontrada</p>
              <p className="text-xs mt-1">As atividades aparecerão aqui conforme você usar o sistema</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-secondary/50 rounded-lg transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm">{getActivityIcon(activity.type)}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <Badge className={`${getActivityColor(activity.type)} text-xs`}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-400">
                    <Avatar className="h-4 w-4 mr-2">
                      <AvatarImage src={activity.user?.avatar_url} />
                      <AvatarFallback>
                        {activity.user?.full_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{activity.user?.full_name}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {formatDistanceToNow(new Date(activity.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button className="text-sm text-primary hover:underline w-full text-center">
              Ver todas as atividades
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
