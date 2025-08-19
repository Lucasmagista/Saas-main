import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown,
  MessageCircle, 
  Mail, 
  Phone,
  Activity,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { makeAuthenticatedRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface KPI {
  title: string;
  value: string | number;
  target: string | number;
  trend: 'up' | 'down';
  change: string;
  description: string;
}

interface ChannelMetric {
  channel: string;
  name: string;
  messages: number;
  responseTime: string;
  satisfaction: number;
  conversion: number;
}

interface TimeMetric {
  period: string;
  whatsapp: number;
  email: number;
  calls: number;
}

interface TeamMember {
  id: string;
  name: string;
  avatar_url: string | null;
  messages: number;
  responseTime: string;
  satisfaction: number;
  status: 'online' | 'away' | 'offline';
  last_login: string | null;
}

export function CommunicationAnalytics() {
  const { toast } = useToast();
  // Dados de analytics obtidos via API
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetric[]>([]);
  const [timeMetrics, setTimeMetrics] = useState<TimeMetric[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamMember[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Função reutilizável para buscar analytics
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const data = await api.get('/api/analytics/communication');
      if (data) {
        setKpis(data.kpis || []);
        setChannelMetrics(data.channelMetrics || []);
        setTimeMetrics(data.timeMetrics || []);
      }
    } catch (err: unknown) {
      console.error('Erro ao carregar analytics', err);
      toast({
        title: "Erro ao carregar analytics",
        description: "Não foi possível carregar os dados de analytics.",
        variant: "destructive"
      });
    } finally {
      setLoadingAnalytics(false);
    }
  }, [toast]);

  // Helper para obter ícone e cores conforme o canal. Se novos canais
  // forem adicionados, ajuste este map. Icones extras importados no topo.
  const getChannelDetails = (channel: string) => {
    const lower = channel.toLowerCase();
    switch (lower) {
      case 'whatsapp':
        return { Icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-50' };
      case 'email':
        return { Icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-50' };
      case 'telefone':
      case 'phone':
        return { Icon: Phone, color: 'text-orange-600', bgColor: 'bg-orange-50' };
      default:
        return { Icon: Activity, color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  // Função para buscar performance da equipe real
  const fetchTeamPerformance = useCallback(async () => {
    try {
      const profiles = await makeAuthenticatedRequest('/api/users/profiles', 'GET');
      
      if (!profiles || !Array.isArray(profiles)) {
        throw new Error('Dados de perfis inválidos');
      }

      // Buscar métricas de interações para cada membro
      const teamData = await Promise.all(
        (profiles || []).map(async (profile) => {
          const interactions = await makeAuthenticatedRequest(`/api/interactions?user_id=${profile.id}&since=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}`, 'GET');

          if (!interactions || !Array.isArray(interactions)) {
            console.error('Erro ao buscar interações para usuário:', profile.id);
            return null;
          }

          // Calcular métricas
          const totalMessages = interactions?.length || 0;
          const completedInteractions = interactions?.filter(i => i.completed_at) || [];
          const avgResponseTime = completedInteractions.length > 0
            ? completedInteractions.reduce((acc, curr) => {
                const created = new Date(curr.created_at);
                const completed = new Date(curr.completed_at);
                const diff = (completed.getTime() - created.getTime()) / (1000 * 60); // em minutos
                return acc + diff;
              }, 0) / completedInteractions.length
            : 0;

          // Simular satisfação baseada no número de interações completas vs total
          const satisfactionScore = completedInteractions.length > 0
            ? Math.min(5, 3.5 + (completedInteractions.length / totalMessages) * 1.5)
            : 0;

          // Determinar status baseado no last_login
          const lastLogin = profile.last_login ? new Date(profile.last_login) : null;
          const now = new Date();
          const minutesSinceLogin = lastLogin 
            ? (now.getTime() - lastLogin.getTime()) / (1000 * 60)
            : Infinity;

          let status: 'online' | 'away' | 'offline' = 'offline';
          if (minutesSinceLogin < 15) status = 'online';
          else if (minutesSinceLogin < 60) status = 'away';

          return {
            id: profile.id,
            name: profile.full_name || 'Usuário',
            avatar_url: profile.avatar_url,
            messages: totalMessages,
            responseTime: avgResponseTime > 0 
              ? `${Math.floor(avgResponseTime)}m ${Math.floor((avgResponseTime % 1) * 60)}s`
              : '-',
            satisfaction: parseFloat(satisfactionScore.toFixed(1)),
            status,
            last_login: profile.last_login
          };
        })
      );

      const filteredTeamData = teamData.filter(Boolean) as TeamMember[];
      setTeamPerformance(filteredTeamData);
    } catch (error) {
      console.error('Erro ao buscar performance da equipe:', error);
      toast({
        title: "Erro ao carregar dados da equipe",
        description: "Não foi possível carregar os dados de performance da equipe.",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Helper functions para simplificar os ternários
  const getStatusColor = (status: string) => {
    if (status === 'online') return 'bg-green-500';
    if (status === 'away') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    if (status === 'online') return 'Online agora';
    if (status === 'away') return 'Ausente';
    return 'Offline';
  };

  const renderTeamContent = () => {
    if (loadingAnalytics) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-muted-foreground">Carregando dados da equipe...</span>
          </div>
        </div>
      );
    }

    if (teamPerformance.length === 0) {
      return (
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Nenhum dado de performance encontrado</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {teamPerformance.map((member) => (
          <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback>
                  {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">{member.name}</h4>
              <p className="text-sm text-muted-foreground">{getStatusText(member.status)}</p>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Mensagens</p>
                <p className="font-semibold">{member.messages}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tempo Resp.</p>
                <p className="font-semibold">{member.responseTime}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
                <p className="font-semibold">{member.satisfaction > 0 ? `${member.satisfaction}/5` : '-'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Função para atualizar dados manualmente
  const handleRefresh = useCallback(() => {
    fetchAnalytics();
    fetchTeamPerformance();
    
    toast({
      title: "Dados atualizados",
      description: "Os dados de analytics foram atualizados com sucesso.",
    });
  }, [fetchAnalytics, fetchTeamPerformance, toast]);

  // Carrega dados de analytics da API ao montar
  useEffect(() => {
    fetchAnalytics();
    fetchTeamPerformance();
  }, [fetchAnalytics, fetchTeamPerformance]);

  // Remover dados mockados - agora usa dados reais
  // const teamPerformance = [...];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics de Comunicação</h3>
          <p className="text-muted-foreground">
            Métricas e insights sobre performance da comunicação
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loadingAnalytics}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingAnalytics ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <Card key={`kpi-${kpi.title}-${index}`} className="hover:shadow-md transition-all">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                  <Badge variant="outline" className="text-xs">
                    Meta: {kpi.target}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{kpi.value}</span>
                  <div className={`flex items-center text-xs ${
                    kpi.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}>
                    {kpi.trend === "up" ? (
                      <TrendingUp className="w-3 h-3 mr-1" />
                    ) : (
                      <TrendingDown className="w-3 h-3 mr-1" />
                    )}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="channels">Por Canal</TabsTrigger>
          <TabsTrigger value="time">Por Horário</TabsTrigger>
          <TabsTrigger value="team">Por Equipe</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
        </TabsList>

        {/* Channel Analytics */}
        <TabsContent value="channels">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {channelMetrics.map((channel, index) => {
              const { Icon, color, bgColor } = getChannelDetails(channel.channel || channel.name || '');
              return (
                <Card key={`channel-${channel.channel || channel.name}-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${bgColor}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                      </div>
                      <CardTitle className="text-lg">{channel.channel || channel.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Mensagens</p>
                        <p className="text-xl font-bold">{(channel.messages ?? 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                        <p className="text-xl font-bold">{channel.responseTime ?? '-'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Satisfação</p>
                        <p className="text-xl font-bold">{channel.satisfaction ?? '-'}{channel.satisfaction ? '/5' : ''}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversão</p>
                        <p className="text-xl font-bold">{channel.conversion ?? '-'}{channel.conversion ? '%' : ''}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Time Analytics */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Horário</CardTitle>
              <CardDescription>
                Volume de comunicação por período do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeMetrics.map((metric, index) => (
                  <div key={`time-${metric.period}-${index}`} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">
                      {metric.period}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                        <div 
                          className={`absolute top-0 left-0 h-full bg-green-500 opacity-80 whatsapp-bar-width`}
                          data-width={metric.whatsapp}
                        />
                        <div 
                          className="absolute top-0 h-full bg-blue-500 opacity-80 analytics-bar email-bar"
                          data-left={((metric.whatsapp / 200) * 100)}
                          data-bar-width={((metric.email / 200) * 100)}
                        />
                        <div 
                          className="absolute top-0 h-full bg-orange-500 opacity-80 analytics-bar calls-bar"
                          data-left={((metric.whatsapp + metric.email) / 200) * 100}
                          data-bar-width={((metric.calls / 200) * 100)}
                        />
                      </div>
                      <div className="text-sm font-medium w-12">
                        {metric.whatsapp + metric.email + metric.calls}
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm">WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm">Email</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="text-sm">Chamadas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Performance */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Performance da Equipe</CardTitle>
              <CardDescription>
                Métricas individuais dos agentes de atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderTeamContent()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends */}
        <TabsContent value="trends">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendências do Mês</CardTitle>
                <CardDescription>
                  Comparativo com mês anterior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Volume de mensagens</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">+23%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tempo de resposta</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">-15%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taxa de conversão</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">+8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Satisfação do cliente</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">+5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metas vs Realizado</CardTitle>
                <CardDescription>
                  Performance contra objetivos definidos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Tempo de resposta</span>
                    <span className="text-sm font-medium">2m 34s / 5m</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-51-percent" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Taxa de resposta</span>
                    <span className="text-sm font-medium">94.2% / 90%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Satisfação</span>
                    <span className="text-sm font-medium">4.8 / 4.5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full-width" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Conversão</span>
                    <span className="text-sm font-medium">28.5% / 25%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}