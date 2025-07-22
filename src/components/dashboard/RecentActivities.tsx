
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
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
        const { data, error } = await supabase
          .from('activities')
          .select(`
            *,
            user:profiles(full_name, avatar_url)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching activities:', error);
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

    // Real-time subscription
    const channel = supabase
      .channel('recent-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activities'
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
        <CardTitle>Atividades Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma atividade recente encontrada
            </p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm">{getActivityIcon(activity.type)}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <Badge className={getActivityColor(activity.type)}>
                      {activity.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
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
      </CardContent>
    </Card>
  );
};
