import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  totalOpportunities: number;
  totalRevenue: number;
  conversionRate: number;
  recentActivities: number;
}

export const DashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalLeads: 0,
    newLeads: 0,
    totalOpportunities: 0,
    totalRevenue: 0,
    conversionRate: 0,
    recentActivities: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchMetrics = async () => {
      try {
        // Buscar leads
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*');

        // Buscar oportunidades
        const { data: opportunitiesData } = await supabase
          .from('opportunities')
          .select('*');

        // Buscar atividades recentes
        const { data: activitiesData } = await supabase
          .from('activities')
          .select('*')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        const totalLeads = leadsData?.length || 0;
        const newLeads = leadsData?.filter(lead => 
          new Date(lead.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).length || 0;

        const totalOpportunities = opportunitiesData?.length || 0;
        const totalRevenue = opportunitiesData?.reduce((sum, opp) => 
          sum + (parseFloat(opp.value?.toString() || '0') || 0), 0
        ) || 0;

        const conversionRate = totalLeads > 0 ? (totalOpportunities / totalLeads) * 100 : 0;
        const recentActivities = activitiesData?.length || 0;

        setMetrics({
          totalLeads,
          newLeads,
          totalOpportunities,
          totalRevenue,
          conversionRate,
          recentActivities,
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();

    // Configurar real-time para atualizações
    const channel = supabase
      .channel('dashboard-metrics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'opportunities' }, fetchMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, fetchMetrics)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const metricCards = [
    {
      title: 'Total de Leads',
      value: metrics.totalLeads,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: metrics.newLeads > 0 ? 'up' : 'neutral',
      trendValue: `+${metrics.newLeads} novos`,
    },
    {
      title: 'Oportunidades',
      value: metrics.totalOpportunities,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: 'up',
      trendValue: 'Ativo',
    },
    {
      title: 'Receita Total',
      value: `R$ ${metrics.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: metrics.totalRevenue > 0 ? 'up' : 'neutral',
      trendValue: `${metrics.totalOpportunities} oportunidades`,
    },
    {
      title: 'Taxa de Conversão',
      value: `${metrics.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: metrics.conversionRate > 20 ? 'up' : 'down',
      trendValue: 'Últimos 30 dias',
    },
    {
      title: 'Atividades Recentes',
      value: metrics.recentActivities,
      icon: Activity,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: 'up',
      trendValue: 'Últimas 24h',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metricCards.map((metric, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold">{metric.value}</p>
                <div className="flex items-center mt-2">
                  {metric.trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  )}
                  {metric.trend === 'down' && (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 
                    metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {metric.trendValue}
                  </span>
                </div>
              </div>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
