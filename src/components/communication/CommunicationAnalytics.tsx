import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  MessageCircle, 
  Mail, 
  Phone,
  Clock,
  Users,
  Target,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from "lucide-react";

export function CommunicationAnalytics() {
  // Mock analytics data
  const kpis = [
    {
      title: "Tempo Médio de Resposta",
      value: "2m 34s",
      change: "-15%",
      trend: "down",
      description: "WhatsApp + Email",
      target: "< 5min"
    },
    {
      title: "Taxa de Resposta",
      value: "94.2%",
      change: "+5%",
      trend: "up",
      description: "Todas as conversas",
      target: "> 90%"
    },
    {
      title: "Satisfação Cliente",
      value: "4.8/5",
      change: "+0.3",
      trend: "up",
      description: "Avaliação média",
      target: "> 4.5"
    },
    {
      title: "Conversões",
      value: "28.5%",
      change: "+12%",
      trend: "up",
      description: "Lead → Cliente",
      target: "> 25%"
    }
  ];

  const channelMetrics = [
    {
      channel: "WhatsApp",
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      messages: 1234,
      responseTime: "1m 45s",
      satisfaction: 4.9,
      conversion: 32.1
    },
    {
      channel: "Email",
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      messages: 856,
      responseTime: "4m 12s",
      satisfaction: 4.6,
      conversion: 24.8
    },
    {
      channel: "Telefone",
      icon: Phone,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      messages: 234,
      responseTime: "8s",
      satisfaction: 4.7,
      conversion: 31.5
    }
  ];

  const timeMetrics = [
    { period: "00-02h", whatsapp: 12, email: 8, calls: 2 },
    { period: "02-04h", whatsapp: 8, email: 5, calls: 1 },
    { period: "04-06h", whatsapp: 15, email: 12, calls: 3 },
    { period: "06-08h", whatsapp: 45, email: 35, calls: 8 },
    { period: "08-10h", whatsapp: 89, email: 67, calls: 15 },
    { period: "10-12h", whatsapp: 156, email: 98, calls: 23 },
    { period: "12-14h", whatsapp: 134, email: 87, calls: 18 },
    { period: "14-16h", whatsapp: 167, email: 123, calls: 28 },
    { period: "16-18h", whatsapp: 145, email: 89, calls: 22 },
    { period: "18-20h", whatsapp: 98, email: 56, calls: 12 },
    { period: "20-22h", whatsapp: 67, email: 34, calls: 7 },
    { period: "22-00h", whatsapp: 34, email: 23, calls: 4 }
  ];

  const teamPerformance = [
    {
      name: "Ana Silva",
      avatar: "/placeholder.svg",
      messages: 234,
      responseTime: "1m 23s",
      satisfaction: 4.9,
      status: "online"
    },
    {
      name: "João Santos",
      avatar: "/placeholder.svg",
      messages: 189,
      responseTime: "2m 15s",
      satisfaction: 4.7,
      status: "away"
    },
    {
      name: "Maria Costa",
      avatar: "/placeholder.svg",
      messages: 156,
      responseTime: "1m 45s",
      satisfaction: 4.8,
      status: "online"
    }
  ];

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
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
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
          <Card key={index} className="hover:shadow-md transition-all">
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
            {channelMetrics.map((channel, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${channel.bgColor}`}>
                      <channel.icon className={`w-5 h-5 ${channel.color}`} />
                    </div>
                    <CardTitle className="text-lg">{channel.channel}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Mensagens</p>
                      <p className="text-xl font-bold">{channel.messages.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo Resposta</p>
                      <p className="text-xl font-bold">{channel.responseTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfação</p>
                      <p className="text-xl font-bold">{channel.satisfaction}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Conversão</p>
                      <p className="text-xl font-bold">{channel.conversion}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium">
                      {metric.period}
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-6 relative overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-green-500 opacity-80"
                          style={{ width: `${(metric.whatsapp / 200) * 100}%` }}
                        />
                        <div 
                          className="absolute top-0 h-full bg-blue-500 opacity-80"
                          style={{ 
                            left: `${(metric.whatsapp / 200) * 100}%`,
                            width: `${(metric.email / 200) * 100}%` 
                          }}
                        />
                        <div 
                          className="absolute top-0 h-full bg-orange-500 opacity-80"
                          style={{ 
                            left: `${((metric.whatsapp + metric.email) / 200) * 100}%`,
                            width: `${(metric.calls / 200) * 100}%` 
                          }}
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
              <div className="space-y-4">
                {teamPerformance.map((member, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="relative">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${
                        member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {member.status === 'online' ? 'Online agora' : 'Ausente'}
                      </p>
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
                        <p className="font-semibold">{member.satisfaction}/5</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '51%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Taxa de resposta</span>
                    <span className="text-sm font-medium">94.2% / 90%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Satisfação</span>
                    <span className="text-sm font-medium">4.8 / 4.5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm">Conversão</span>
                    <span className="text-sm font-medium">28.5% / 25%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
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