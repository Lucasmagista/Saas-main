import { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useRealTimeNotifications } from '@/hooks/useRealTimeNotifications';
import { useDashboardData } from '@/hooks/useDashboardData';
import { seedDashboardData } from '@/lib/seedData';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, Users, DollarSign, Target, Activity, Calendar, Filter, Download, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const { profile } = useAuth();
  const { notifications, unreadCount } = useRealTimeNotifications();
  const dashboardData = useDashboardData();
  const [timeRange, setTimeRange] = useState('7d');
  const [dataSeeded, setDataSeeded] = useState(false);

  const { salesData, distributionData, conversionData, performanceMetrics } = dashboardData;

  // Criar dados iniciais se necessário
  useEffect(() => {
    const initializeData = async () => {
      if (!dataSeeded) {
        await seedDashboardData();
        setDataSeeded(true);
      }
    };

    initializeData();
  }, [dataSeeded]);

  // Buscar algumas oportunidades recentes para exibir
  const recentDeals = [
    { title: 'Sistema CRM - Tech Corp', stage: 'Negociação', value: 150000, probability: 75 },
    { title: 'Consultoria - StartUp Inc', stage: 'Proposta', value: 85000, probability: 60 },
    { title: 'Projeto Web - Digital Ltd', stage: 'Qualificação', value: 45000, probability: 30 },
    { title: 'Automação - Factory Co', stage: 'Fechado', value: 120000, probability: 100 },
    { title: 'Mobile App - Retail Store', stage: 'Negociação', value: 95000, probability: 80 },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-background via-background to-secondary/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              Bem-vindo, {profile?.full_name || 'Usuário'}! 
              <span className="text-2xl">👋</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Aqui está um resumo das suas atividades hoje
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 dias</SelectItem>
                <SelectItem value="30d">30 dias</SelectItem>
                <SelectItem value="90d">90 dias</SelectItem>
                <SelectItem value="1y">1 ano</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <DashboardMetrics />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Trend */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Tendência de Vendas</CardTitle>
                  <p className="text-sm text-muted-foreground">Evolução mensal de vendas e leads</p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12.5%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="vendas" 
                    stroke="#3b82f6" 
                    fillOpacity={1}
                    fill="url(#colorVendas)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#10b981" 
                    fillOpacity={1}
                    fill="url(#colorLeads)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lead Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Leads</CardTitle>
              <p className="text-sm text-muted-foreground">Por temperatura</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {distributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-3 h-3 rounded-full ${
                          item.color === '#ef4444' ? 'bg-red-500' :
                          item.color === '#f59e0b' ? 'bg-amber-500' :
                          'bg-gray-500'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversion Funnel & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Funil de Conversão</CardTitle>
              <p className="text-sm text-muted-foreground">Taxa de conversão por etapa</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={conversionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="stage" 
                    type="category" 
                    width={80}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <div>
            <RecentActivities />
          </div>
        </div>

        {/* Recent Deals & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Deals */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Negócios Recentes</CardTitle>
                  <p className="text-sm text-muted-foreground">Últimas oportunidades criadas</p>
                </div>
                <Button variant="ghost" size="sm">Ver todos</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentDeals.map((deal, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{deal.title}</p>
                        <p className="text-sm text-muted-foreground">{deal.stage}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        R$ {(deal.value || 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">{deal.probability}%</p>
                    </div>
                  </div>
                ))}
                {recentDeals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma oportunidade recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Criar Novo Lead
                  </div>
                  <div className="text-sm text-muted-foreground">Adicionar contato qualificado</div>
                </div>
              </Button>
              
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Nova Oportunidade
                  </div>
                  <div className="text-sm text-muted-foreground">Criar negócio potencial</div>
                </div>
              </Button>
              
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Agendar Follow-up
                  </div>
                  <div className="text-sm text-muted-foreground">Marcar próximo contato</div>
                </div>
              </Button>
              
              <Button className="w-full justify-start h-auto p-4" variant="outline">
                <div className="text-left">
                  <div className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ver Agenda
                  </div>
                  <div className="text-sm text-muted-foreground">Compromissos do dia</div>
                </div>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Visão Geral de Performance</CardTitle>
            <p className="text-sm text-muted-foreground">Métricas principais do período selecionado</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{performanceMetrics.totalLeads}</div>
                <div className="text-sm text-muted-foreground">Total de Leads</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+8.2%</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{performanceMetrics.totalOpportunities}</div>
                <div className="text-sm text-muted-foreground">Oportunidades</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+15.4%</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  R$ {(performanceMetrics.totalRevenue / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-muted-foreground">Receita Total</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">+{performanceMetrics.growthRate}%</span>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {performanceMetrics.conversionRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Taxa Conversão</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  {performanceMetrics.conversionRate > 25 ? (
                    <>
                      <ArrowUpRight className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600">+2.1%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3 text-red-600" />
                      <span className="text-xs text-red-600">-1.4%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
