
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Award,
  AlertCircle,
  CheckCircle,
  Calendar,
  Target
} from "lucide-react";

interface HRDashboardProps {
  metrics: {
    totalEmployees: number;
    activeJobs: number;
    pendingCandidates: number;
    avgHiringTime: number;
    turnoverRate: number;
    engagementScore: number;
    diversityIndex: number;
    complianceScore: number;
  };
}

export const HRDashboard: React.FC<HRDashboardProps> = ({ metrics }) => {
  // Dados simulados para gráficos
  const hiringFunnelData = [
    { stage: 'Candidatos', count: 150, percentage: 100 },
    { stage: 'Triagem', count: 89, percentage: 59 },
    { stage: 'Entrevista', count: 45, percentage: 30 },
    { stage: 'Teste Técnico', count: 28, percentage: 19 },
    { stage: 'Proposta', count: 15, percentage: 10 },
    { stage: 'Contratados', count: 12, percentage: 8 }
  ];

  const departmentData = [
    { name: 'Tecnologia', employees: 85, color: '#3b82f6' },
    { name: 'Vendas', employees: 64, color: '#10b981' },
    { name: 'Marketing', employees: 42, color: '#f59e0b' },
    { name: 'Operações', employees: 38, color: '#ef4444' },
    { name: 'Financeiro', employees: 28, color: '#8b5cf6' },
    { name: 'RH', employees: 15, color: '#06b6d4' },
    { name: 'Jurídico', employees: 12, color: '#f97316' }
  ];

  const monthlyHiringData = [
    { month: 'Jan', hired: 8, target: 10 },
    { month: 'Fev', hired: 12, target: 10 },
    { month: 'Mar', hired: 15, target: 12 },
    { month: 'Abr', hired: 18, target: 15 },
    { month: 'Mai', hired: 14, target: 15 },
    { month: 'Jun', hired: 22, target: 18 },
    { month: 'Jul', hired: 16, target: 18 }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'hire',
      message: 'João Silva foi contratado para Desenvolvedor Senior',
      timestamp: '2 horas atrás',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 2,
      type: 'interview',
      message: '5 entrevistas agendadas para esta semana',
      timestamp: '4 horas atrás',
      icon: Calendar,
      color: 'text-blue-500'
    },
    {
      id: 3,
      type: 'job',
      message: 'Nova vaga publicada: Analista de Marketing',
      timestamp: '6 horas atrás',
      icon: Target,
      color: 'text-purple-500'
    },
    {
      id: 4,
      type: 'alert',
      message: 'Meta de contratação de julho atingida',
      timestamp: '1 dia atrás',
      icon: Award,
      color: 'text-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Resumo Executivo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiência de Contratação</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +12% vs mês anterior
            </div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Interna</CardTitle>
            <Award className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagementScore}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +5% vs trimestre anterior
            </div>
            <Progress value={metrics.engagementScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo de Contratação</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgHiringTime} dias</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -3 dias vs meta (17d)
            </div>
            <Progress value={77} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retenção de Talentos</CardTitle>
            <Users className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{100 - metrics.turnoverRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +2.3% vs ano anterior
            </div>
            <Progress value={100 - metrics.turnoverRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funil de Contratação */}
        <Card>
          <CardHeader>
            <CardTitle>Funil de Contratação</CardTitle>
            <CardDescription>
              Conversão por etapa do processo seletivo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hiringFunnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="stage" type="category" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Departamento */}
        <Card>
          <CardHeader>
            <CardTitle>Colaboradores por Departamento</CardTitle>
            <CardDescription>
              Distribuição atual do quadro de funcionários
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="employees"
                >
                  {departmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} pessoas`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendências e Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tendência de Contratações */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tendência de Contratações</CardTitle>
            <CardDescription>
              Contratações realizadas vs meta mensal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyHiringData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stackId="1" 
                  stroke="#e5e7eb" 
                  fill="#e5e7eb" 
                  name="Meta"
                />
                <Area 
                  type="monotone" 
                  dataKey="hired" 
                  stackId="2" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  name="Contratados"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atualizações do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <IconComponent className={`h-5 w-5 mt-0.5 ${activity.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Ver todas as atividades
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
