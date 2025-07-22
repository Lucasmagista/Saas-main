
import React, { useState } from 'react';
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
  TrendingUp, 
  Target, 
  Calendar,
  Star,
  MessageSquare,
  FileText,
  Eye,
  Plus
} from "lucide-react";

export const PerformanceReview = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("2024");

  // Dados simulados de avaliações
  const performanceData = [
    {
      id: 1,
      employee: {
        name: "João Silva",
        position: "Desenvolvedor Senior",
        department: "Tecnologia",
        avatar: "/avatars/joao.jpg"
      },
      period: "2024 Q2",
      overall: 92,
      goals: 88,
      skills: 95,
      leadership: 85,
      collaboration: 90,
      status: "completed",
      reviewer: "Maria Santos",
      reviewDate: "2024-07-15",
      feedback: "Excelente performance, superou expectativas"
    },
    {
      id: 2,
      employee: {
        name: "Ana Costa",
        position: "Gerente de Marketing",
        department: "Marketing",
        avatar: "/avatars/ana.jpg"
      },
      period: "2024 Q2",
      overall: 88,
      goals: 92,
      skills: 85,
      leadership: 90,
      collaboration: 87,
      status: "completed",
      reviewer: "Carlos Lima",
      reviewDate: "2024-07-12",
      feedback: "Liderança forte, atingiu todas as metas"
    },
    {
      id: 3,
      employee: {
        name: "Pedro Oliveira",
        position: "Designer UX",
        department: "Design",
        avatar: "/avatars/pedro.jpg"
      },
      period: "2024 Q2",
      overall: 85,
      goals: 82,
      skills: 88,
      leadership: 80,
      collaboration: 90,
      status: "in_progress",
      reviewer: "Ana Costa",
      reviewDate: null,
      feedback: null
    }
  ];

  const departmentPerformance = [
    { department: 'Tecnologia', score: 89, employees: 25 },
    { department: 'Marketing', score: 87, employees: 18 },
    { department: 'Vendas', score: 91, employees: 22 },
    { department: 'Design', score: 85, employees: 12 },
    { department: 'Financeiro', score: 88, employees: 15 }
  ];

  const skillsRadarData = [
    { skill: 'Técnica', fullMark: 100, current: 88 },
    { skill: 'Liderança', fullMark: 100, current: 75 },
    { skill: 'Comunicação', fullMark: 100, current: 82 },
    { skill: 'Colaboração', fullMark: 100, current: 90 },
    { skill: 'Inovação', fullMark: 100, current: 78 },
    { skill: 'Resultados', fullMark: 100, current: 85 }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Concluída', variant: 'default' as const },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
      pending: { label: 'Pendente', variant: 'outline' as const },
      overdue: { label: 'Atrasada', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

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
                <p className="text-2xl font-bold">88%</p>
              </div>
              <Award className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={88} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">67</p>
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
                <p className="text-2xl font-bold">12</p>
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
                <p className="text-2xl font-bold">23</p>
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
