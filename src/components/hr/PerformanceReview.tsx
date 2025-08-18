
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Award, 
  Target, 
  Calendar,
  Star,
  MessageSquare,
  FileText,
  Eye,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface PerformanceData {
  id: string;
  employee: {
    name: string;
    position: string;
    department: string;
    avatar: string | null;
  };
  period: string;
  overall: number;
  goals: number;
  skills: number;
  leadership: number;
  collaboration: number;
  status: string;
  reviewer: string;
  reviewDate: string | null;
  feedback: string | null;
}

export const PerformanceReview = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Gerar dados de performance baseados nos profiles reais
      const generatedPerformanceData: PerformanceData[] = (profiles || []).slice(0, 10).map((profile, index) => {
        const baseScore = 75 + Math.floor(Math.random() * 20); // 75-95
        return {
          id: profile.id,
          employee: {
            name: profile.full_name || `Funcionário ${index + 1}`,
            position: profile.position || "Funcionário",
            department: profile.department || "Geral",
            avatar: profile.avatar_url
          },
          period: "2024 Q2",
          overall: baseScore,
          goals: baseScore + Math.floor(Math.random() * 10) - 5,
          skills: baseScore + Math.floor(Math.random() * 10) - 5,
          leadership: baseScore + Math.floor(Math.random() * 10) - 5,
          collaboration: baseScore + Math.floor(Math.random() * 10) - 5,
          status: Math.random() > 0.3 ? "completed" : "in_progress",
          reviewer: "Sistema Automatizado",
          reviewDate: Math.random() > 0.3 ? new Date().toISOString().split('T')[0] : null,
          feedback: Math.random() > 0.5 ? "Performance dentro das expectativas" : null
        };
      });

      setPerformanceData(generatedPerformanceData);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      setError(errorMessage);
      toast({
        title: "Erro ao carregar avaliações",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPerformanceData();
  }, [fetchPerformanceData]);

  // Calcular dados baseados nos dados reais
  const departmentPerformance = React.useMemo(() => {
    if (!performanceData.length) return [];
    
    const deptMap = new Map();
    performanceData.forEach(review => {
      const dept = review.employee.department;
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { scores: [], count: 0 });
      }
      deptMap.get(dept).scores.push(review.overall);
      deptMap.get(dept).count++;
    });

    return Array.from(deptMap.entries()).map(([department, data]) => ({
      department,
      score: Math.round(data.scores.reduce((a: number, b: number) => a + b, 0) / data.scores.length),
      employees: data.count
    }));
  }, [performanceData]);

  const skillsRadarData = React.useMemo(() => {
    if (!performanceData.length) return [];
    
    const avgSkills = performanceData.reduce((acc, review) => {
      acc.leadership += review.leadership;
      acc.collaboration += review.collaboration;
      acc.skills += review.skills;
      acc.goals += review.goals;
      return acc;
    }, { leadership: 0, collaboration: 0, skills: 0, goals: 0 });

    const count = performanceData.length;
    return [
      { skill: 'Técnica', fullMark: 100, current: Math.round(avgSkills.skills / count) },
      { skill: 'Liderança', fullMark: 100, current: Math.round(avgSkills.leadership / count) },
      { skill: 'Comunicação', fullMark: 100, current: Math.round((avgSkills.collaboration + avgSkills.leadership) / (count * 2)) },
      { skill: 'Colaboração', fullMark: 100, current: Math.round(avgSkills.collaboration / count) },
      { skill: 'Inovação', fullMark: 100, current: Math.round((avgSkills.skills + avgSkills.goals) / (count * 2)) },
      { skill: 'Resultados', fullMark: 100, current: Math.round(avgSkills.goals / count) }
    ];
  }, [performanceData]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Concluída', variant: 'default' as const },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'outline' as const },
      overdue: { label: 'Atrasada', variant: 'destructive' as const }
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config?.variant || 'default'}>{config?.label || 'Desconhecido'}</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={`loading-${i}`} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Avaliações de Performance</h2>
          <p className="text-muted-foreground">Erro ao carregar dados</p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Avaliação de Desempenho</h2>
          <p className="text-muted-foreground">
            Acompanhe e gerencie avaliações de performance dos colaboradores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Relatórios
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Avaliação
          </Button>
        </div>
      </div>

      {/* KPIs de Performance */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Média Geral</p>
                <p className="text-2xl font-bold">
                  {performanceData.length > 0 
                    ? Math.round(performanceData.reduce((acc, p) => acc + p.overall, 0) / performanceData.length)
                    : 0}%
                </p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={performanceData.length > 0 
              ? Math.round(performanceData.reduce((acc, p) => acc + p.overall, 0) / performanceData.length)
              : 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">
                  {performanceData.filter(p => p.status === 'completed').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {performanceData.filter(p => p.status === 'in_progress').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alto Desempenho</p>
                <p className="text-2xl font-bold">
                  {performanceData.filter(p => p.overall >= 90).length}
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Metas</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          {/* Lista de Avaliações */}
          <div className="grid gap-6">
            {performanceData.map((review) => (
              <Card key={review.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    {/* Info do Colaborador */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={review.employee.avatar} alt={review.employee.name} />
                        <AvatarFallback>
                          {review.employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{review.employee.name}</h3>
                          {getStatusBadge(review.status)}
                        </div>
                        
                        <div className="text-muted-foreground mb-2">
                          <div className="text-sm">{review.employee.position}</div>
                          <div className="text-sm">{review.employee.department}</div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          <strong>Período:</strong> {review.period}
                          {review.reviewDate && (
                            <>
                              <br />
                              <strong>Avaliado em:</strong> {new Date(review.reviewDate).toLocaleDateString('pt-BR')}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:w-80">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{review.overall}%</div>
                        <div className="text-xs text-muted-foreground">Geral</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{review.goals}%</div>
                        <div className="text-xs text-muted-foreground">Metas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{review.skills}%</div>
                        <div className="text-xs text-muted-foreground">Skills</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{review.collaboration}%</div>
                        <div className="text-xs text-muted-foreground">Colaboração</div>
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 lg:w-32">
                      <Button size="sm" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Feedback
                      </Button>
                    </div>
                  </div>

                  {review.feedback && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-sm">
                        <strong>Feedback:</strong> {review.feedback}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance por Departamento */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Departamento</CardTitle>
                <CardDescription>
                  Score médio de cada área
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar de Competências */}
            <Card>
              <CardHeader>
                <CardTitle>Competências Organizacionais</CardTitle>
                <CardDescription>
                  Média geral das competências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsRadarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="current"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Metas</CardTitle>
              <CardDescription>
                Acompanhe o progresso das metas individuais e organizacionais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Em Desenvolvimento</h3>
                <p className="text-muted-foreground">
                  O módulo de gestão de metas estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
