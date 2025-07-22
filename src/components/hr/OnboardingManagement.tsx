
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  FileText,
  Mail,
  Key,
  Laptop,
  GraduationCap,
  Users,
  Coffee,
  Building
} from "lucide-react";

export const OnboardingManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);

  // Dados simulados de onboarding
  const onboardingList = [
    {
      id: 1,
      employee: {
        name: "Lucas Ferreira",
        position: "Desenvolvedor Frontend",
        department: "Tecnologia",
        startDate: "2025-07-22",
        avatar: "/avatars/lucas.jpg"
      },
      progress: 45,
      status: "in_progress",
      buddy: "João Silva",
      manager: "Maria Santos",
      completedTasks: 9,
      totalTasks: 20
    },
    {
      id: 2,
      employee: {
        name: "Camila Santos",
        position: "Analista de Marketing",
        department: "Marketing",
        startDate: "2025-07-25",
        avatar: "/avatars/camila.jpg"
      },
      progress: 15,
      status: "scheduled",
      buddy: "Ana Costa",
      manager: "Carlos Lima",
      completedTasks: 3,
      totalTasks: 20
    },
    {
      id: 3,
      employee: {
        name: "Rafael Oliveira",
        position: "Gerente de Vendas",
        department: "Vendas",
        startDate: "2025-07-18",
        avatar: "/avatars/rafael.jpg"
      },
      progress: 95,
      status: "completing",
      buddy: "Pedro Silva",
      manager: "Roberto Santos",
      completedTasks: 19,
      totalTasks: 20
    }
  ];

  // Template de checklist de onboarding
  const onboardingChecklist = [
    {
      category: "Documentação",
      icon: FileText,
      tasks: [
        { id: 1, title: "Contrato assinado", completed: true },
        { id: 2, title: "Documentos pessoais enviados", completed: true },
        { id: 3, title: "Termo de confidencialidade", completed: true },
        { id: 4, title: "Política de compliance", completed: false }
      ]
    },
    {
      category: "Acesso e Equipamentos",
      icon: Key,
      tasks: [
        { id: 5, title: "Conta de email criada", completed: true },
        { id: 6, title: "Acesso aos sistemas", completed: true },
        { id: 7, title: "Notebook configurado", completed: false },
        { id: 8, title: "Acesso ao prédio", completed: false }
      ]
    },
    {
      category: "Integração",
      icon: Users,
      tasks: [
        { id: 9, title: "Apresentação ao time", completed: true },
        { id: 10, title: "Reunião com gestor", completed: true },
        { id: 11, title: "Buddy designado", completed: true },
        { id: 12, title: "Tour pelas instalações", completed: false }
      ]
    },
    {
      category: "Treinamentos",
      icon: GraduationCap,
      tasks: [
        { id: 13, title: "Treinamento de segurança", completed: false },
        { id: 14, title: "Cultura organizacional", completed: false },
        { id: 15, title: "Processos da área", completed: false },
        { id: 16, title: "Ferramentas de trabalho", completed: false }
      ]
    }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { label: 'Agendado', variant: 'outline' as const },
      in_progress: { label: 'Em Andamento', variant: 'secondary' as const },
      completing: { label: 'Finalizando', variant: 'default' as const },
      completed: { label: 'Concluído', variant: 'default' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    return "bg-orange-500";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Onboarding Digital</h2>
          <p className="text-muted-foreground">
            Acompanhe e gerencie a integração de novos colaboradores
          </p>
        </div>
        <Button>
          <User className="h-4 w-4 mr-2" />
          Novo Onboarding
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">7d</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
                <p className="text-2xl font-bold">94%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Onboardings */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novos Colaboradores</CardTitle>
              <CardDescription>
                Acompanhe o progresso da integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {onboardingList.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedEmployee === item.id ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedEmployee(item.id)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={item.employee.avatar} alt={item.employee.name} />
                      <AvatarFallback>
                        {item.employee.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.employee.name}</h4>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        <div>{item.employee.position} • {item.employee.department}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Início: {new Date(item.employee.startDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Progress value={item.progress} className="flex-1" />
                        <span className="text-sm font-medium">{item.progress}%</span>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {item.completedTasks}/{item.totalTasks} tarefas concluídas
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Checklist Detalhado */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Checklist de Onboarding</CardTitle>
              <CardDescription>
                Template padrão de integração
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {onboardingChecklist.map((category) => {
                const IconComponent = category.icon;
                const completedCount = category.tasks.filter(task => task.completed).length;
                const progress = (completedCount / category.tasks.length) * 100;
                
                return (
                  <div key={category.category} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-primary" />
                      <h4 className="font-medium">{category.category}</h4>
                      <Badge variant="outline" className="ml-auto">
                        {completedCount}/{category.tasks.length}
                      </Badge>
                    </div>
                    
                    <Progress value={progress} className="h-2" />
                    
                    <div className="space-y-2 ml-7">
                      {category.tasks.map((task) => (
                        <div key={task.id} className="flex items-center space-x-2">
                          <Checkbox 
                            checked={task.completed}
                            className="h-4 w-4"
                          />
                          <label className={`text-sm ${
                            task.completed ? 'line-through text-muted-foreground' : ''
                          }`}>
                            {task.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Mail className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Enviar welcome kit</div>
                  <div className="text-xs text-muted-foreground">Para Lucas Ferreira</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <Laptop className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Configurar equipamentos</div>
                  <div className="text-xs text-muted-foreground">Para Camila Santos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Coffee className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium">Agendar café com time</div>
                  <div className="text-xs text-muted-foreground">Para Rafael Oliveira</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
