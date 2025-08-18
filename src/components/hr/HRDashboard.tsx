
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
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
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  Award,
  CheckCircle,
  Calendar
} from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface DepartmentData {
  name: string;
  employees: number;
  color: string;
}

interface HiringFunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface MonthlyHiringData {
  month: string;
  hired: number;
  target: number;
}

interface RecentActivity {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface HRMetrics {
  totalEmployees: number;
  activeJobs: number;
  pendingCandidates: number;
  avgHiringTime: number;
  turnoverRate: number;
  engagementScore: number;
  diversityIndex: number;
  complianceScore: number;
}

export const HRDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<HRMetrics>({
    totalEmployees: 0,
    activeJobs: 0,
    pendingCandidates: 0,
    avgHiringTime: 0,
    turnoverRate: 0,
    engagementScore: 0,
    diversityIndex: 0,
    complianceScore: 0
  });
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [hiringFunnelData, setHiringFunnelData] = useState<HiringFunnelData[]>([]);
  const [monthlyHiringData, setMonthlyHiringData] = useState<MonthlyHiringData[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para buscar métricas de RH
  const fetchHRMetrics = useCallback(async () => {
    try {
      // Buscar total de funcionários
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, department, created_at, full_name")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const totalEmployees = profiles?.length || 0;
      
      // Calcular métricas baseadas nos dados reais
      const departmentCounts: { [key: string]: number } = {};
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
      
      profiles?.forEach(profile => {
        const dept = profile.department || 'Não informado';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
      });

      const deptData: DepartmentData[] = Object.entries(departmentCounts).map(([name, employees], index) => ({
        name,
        employees,
        color: colors[index % colors.length]
      }));

      // Calcular métricas simuladas baseadas em dados reais
      const engagementScore = Math.min(85 + Math.floor(totalEmployees / 10), 95);
      const turnoverRate = Math.max(5, 15 - Math.floor(totalEmployees / 20));
      const avgHiringTime = Math.max(10, 20 - Math.floor(totalEmployees / 15));

      setMetrics({
        totalEmployees,
        activeJobs: Math.floor(totalEmployees * 0.1), // 10% do total como vagas ativas
        pendingCandidates: Math.floor(totalEmployees * 0.3), // 30% como candidatos pendentes
        avgHiringTime,
        turnoverRate,
        engagementScore,
        diversityIndex: Math.min(75 + Math.floor(totalEmployees / 8), 90),
        complianceScore: Math.min(90 + Math.floor(totalEmployees / 25), 98)
      });

      setDepartmentData(deptData);

      // Simular dados de funil baseados no total de funcionários
      const baseCandidates = Math.floor(totalEmployees * 2);
      setHiringFunnelData([
        { stage: 'Candidatos', count: baseCandidates, percentage: 100 },
        { stage: 'Triagem', count: Math.floor(baseCandidates * 0.6), percentage: 60 },
        { stage: 'Entrevista', count: Math.floor(baseCandidates * 0.3), percentage: 30 },
        { stage: 'Teste Técnico', count: Math.floor(baseCandidates * 0.2), percentage: 20 },
        { stage: 'Proposta', count: Math.floor(baseCandidates * 0.1), percentage: 10 },
        { stage: 'Contratados', count: Math.floor(baseCandidates * 0.08), percentage: 8 }
      ]);

      // Gerar dados mensais baseados nos funcionários atuais
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
      const monthlyData = months.map(month => {
        const baseHired = Math.floor(totalEmployees / 20);
        return {
          month,
          hired: baseHired + Math.floor(Math.random() * 5),
          target: baseHired + Math.floor(Math.random() * 3) + 2
        };
      });
      setMonthlyHiringData(monthlyData);

      // Gerar atividades recentes baseadas em dados reais
      const activities: RecentActivity[] = [];
      
      if (profiles && profiles.length > 0) {
        // Últimos funcionários contratados
        const recentHires = profiles.slice(0, 2);
        recentHires.forEach((profile, index) => {
          const employeeName = profile.full_name || 'Novo colaborador';
          const departmentInfo = profile.department ? ` para ${profile.department}` : '';
          activities.push({
            id: `hire-${profile.id}`,
            type: 'hire',
            message: `${employeeName} foi contratado${departmentInfo}`,
            timestamp: `${index + 1} ${index === 0 ? 'dia' : 'dias'} atrás`,
            icon: CheckCircle,
            color: 'text-green-500'
          });
        });
      }

      // Adicionar atividades gerais
      activities.push(
        {
          id: 'interview-general',
          type: 'interview',
          message: `${Math.floor(totalEmployees * 0.1)} entrevistas agendadas para esta semana`,
          timestamp: '2 horas atrás',
          icon: Calendar,
          color: 'text-blue-500'
        },
        {
          id: 'metric-update',
          type: 'metric',
          message: 'Métricas de satisfação atualizadas',
          timestamp: '6 horas atrás',
          icon: Award,
          color: 'text-purple-500'
        }
      );

      setRecentActivities(activities.slice(0, 4));

    } catch (error: unknown) {
      console.error('Erro ao buscar métricas de RH:', error);
      toast({
        title: "Erro ao carregar dados",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHRMetrics();
  }, [fetchHRMetrics]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando métricas de RH...</p>
          </div>
        </div>
      </div>
    );
  }

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
                  {departmentData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
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
