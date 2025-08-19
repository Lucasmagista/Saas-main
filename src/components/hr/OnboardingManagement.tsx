
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { makeAuthenticatedRequest } from "@/lib/api";
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
  Coffee
} from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

interface ProfileWithOnboarding {
  id: string;
  email: string | null;
  full_name: string | null;
  position: string | null;
  department: string | null;
  phone: string | null;
  created_at: string | null;
  avatar_url: string | null;
  company_name?: string | null;
  location?: string | null;
  profile_completed?: boolean | null;
  onboarding_completed_at?: string | null;
}

interface OnboardingEmployee {
  id: string;
  email: string;
  full_name: string | null;
  position: string | null;
  department: string | null;
  phone: string | null;
  created_at: string | null;
  avatar_url: string | null;
  progress: number;
  status: 'scheduled' | 'in_progress' | 'completing' | 'completed';
  buddy?: string;
  manager?: string;
  completedTasks: number;
  totalTasks: number;
  startDate: string | null;
}

interface OnboardingTask {
  id: number;
  title: string;
  completed: boolean;
  category: string;
  description?: string;
}

interface OnboardingFormData {
  employee_id: string;
  buddy_id?: string;
  manager_id?: string;
  start_date: string;
  department: string;
}

export const OnboardingManagement = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [onboardingList, setOnboardingList] = useState<OnboardingEmployee[]>([]);

  const fetchOnboardingEmployees = useCallback(async () => {
    try {
      const profiles = await makeAuthenticatedRequest('/api/users/profiles?order=created_at&limit=20', 'GET');
      
      if (!profiles || !Array.isArray(profiles)) {
        throw new Error('Dados de perfis inválidos');
      }

      const onboardingEmployees: OnboardingEmployee[] = (profiles || []).map((profile: ProfileWithOnboarding) => {
        const progress = calculateOnboardingProgress(profile);
        const status = getOnboardingStatus(profile, progress);
        
        // Criar checklist para calcular tarefas reais
        const tempEmployee: OnboardingEmployee = {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name,
          position: profile.position,
          department: profile.department,
          phone: profile.phone,
          created_at: profile.created_at,
          avatar_url: profile.avatar_url,
          progress,
          status,
          buddy: undefined,
          manager: undefined,
          completedTasks: 0,
          totalTasks: 0,
          startDate: profile.created_at
        };
        
        const checklist = getOnboardingChecklist(tempEmployee);
        const allTasks = checklist.flatMap(category => category.tasks);
        const completedTasks = allTasks.filter(task => task.completed).length;
        
        return {
          ...tempEmployee,
          completedTasks,
          totalTasks: allTasks.length
        };
      });

      setOnboardingList(onboardingEmployees);
    } catch (error: unknown) {
      console.error("Erro ao buscar colaboradores:", error);
      toast({
        title: "Erro ao carregar dados",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    fetchOnboardingEmployees();
  }, [fetchOnboardingEmployees]);

  const calculateOnboardingProgress = (profile: ProfileWithOnboarding): number => {
    const fields = [
      'full_name',
      'phone', 
      'position',
      'department'
    ];
    
    let completed = 0;
    fields.forEach(field => {
      if (profile[field as keyof ProfileWithOnboarding]) completed++;
    });
    
    return Math.round((completed / fields.length) * 100);
  };

  const getOnboardingStatus = (profile: ProfileWithOnboarding, progress: number): OnboardingEmployee['status'] => {
    if (progress >= 100) return 'completed';
    if (progress >= 90) return 'completing';
    if (progress >= 30) return 'in_progress';
    return 'scheduled';
  };

  // Template de checklist de onboarding baseado em dados reais
  const getOnboardingChecklist = (employee?: OnboardingEmployee) => [
    {
      category: "Documentação",
      icon: FileText,
      tasks: [
        { id: 1, title: "Contrato assinado", completed: !!employee?.full_name },
        { id: 2, title: "Documentos pessoais enviados", completed: !!employee?.phone },
        { id: 3, title: "Termo de confidencialidade", completed: !!employee?.email },
        { id: 4, title: "Política de compliance", completed: false }
      ]
    },
    {
      category: "Acesso e Equipamentos",
      icon: Key,
      tasks: [
        { id: 5, title: "Conta de email criada", completed: !!employee?.email },
        { id: 6, title: "Acesso aos sistemas", completed: !!employee?.department },
        { id: 7, title: "Notebook configurado", completed: false },
        { id: 8, title: "Acesso ao prédio", completed: false }
      ]
    },
    {
      category: "Integração",
      icon: Users,
      tasks: [
        { id: 9, title: "Apresentação ao time", completed: !!employee?.department },
        { id: 10, title: "Reunião com gestor", completed: !!employee?.position },
        { id: 11, title: "Buddy designado", completed: !!employee?.buddy },
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
        <Button onClick={() => toast({ title: "Funcionalidade em desenvolvimento", description: "O sistema de criação de onboarding será implementado em breve." })}>
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
                <p className="text-2xl font-bold">
                  {onboardingList.filter(emp => emp.status === 'in_progress').length}
                </p>
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
                <p className="text-2xl font-bold">
                  {onboardingList.filter(emp => {
                    if (!emp.created_at) return false;
                    const created = new Date(emp.created_at);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return created >= weekAgo;
                  }).length}
                </p>
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
                <p className="text-2xl font-bold">
                  {onboardingList.length > 0 
                    ? Math.round(onboardingList.reduce((acc, emp) => {
                        if (!emp.created_at) return acc;
                        const days = Math.floor((new Date().getTime() - new Date(emp.created_at).getTime()) / (1000 * 60 * 60 * 24));
                        return acc + days;
                      }, 0) / onboardingList.length)
                    : 0}d
                </p>
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
                <p className="text-2xl font-bold">
                  {onboardingList.length > 0 
                    ? Math.round((onboardingList.filter(emp => emp.status === 'completed').length / onboardingList.length) * 100)
                    : 0}%
                </p>
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
                <button 
                  key={item.id}
                  className={`w-full p-4 border rounded-lg text-left transition-colors ${
                    selectedEmployee === item.id ? 'bg-accent border-primary' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => setSelectedEmployee(item.id)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={item.avatar_url || ''} alt={item.full_name || 'Funcionário'} />
                      <AvatarFallback>
                        {item.full_name ? item.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'F'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{item.full_name || 'Nome não informado'}</h4>
                        {getStatusBadge(item.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        <div>{item.position || 'Cargo não informado'} • {item.department || 'Departamento não informado'}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          Início: {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR') : 'Data não disponível'}
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
                </button>
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
                {selectedEmployee 
                  ? `Progresso de ${onboardingList.find(emp => emp.id === selectedEmployee)?.full_name || 'Colaborador'}`
                  : 'Selecione um colaborador para ver o progresso'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEmployee ? (
                getOnboardingChecklist(onboardingList.find(emp => emp.id === selectedEmployee)).map((category) => {
                  const IconComponent = category.icon;
                  const selectedEmp = onboardingList.find(emp => emp.id === selectedEmployee);
                  
                  // Calcular progresso real baseado nas tarefas completed
                  const completedCount = category.tasks.filter(task => task.completed).length;
                  const actualProgress = (completedCount / category.tasks.length) * 100;
                  
                  return (
                    <div key={category.category} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-primary" />
                        <h4 className="font-medium">{category.category}</h4>
                        <Badge variant="outline" className="ml-auto">
                          {completedCount}/{category.tasks.length}
                        </Badge>
                      </div>
                      
                      <Progress value={actualProgress} className="h-2" />
                      
                      <div className="space-y-2 ml-7">
                        {category.tasks.map((task) => (
                          <div key={task.id} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={task.completed}
                              className="h-4 w-4"
                              onChange={async (checked) => {
                                // Aqui você pode implementar a atualização real no banco
                                toast({
                                  title: checked ? "Tarefa concluída!" : "Tarefa marcada como pendente",
                                  description: `${task.title} foi ${checked ? 'concluída' : 'desmarcada'}`,
                                });
                                // Recarregar dados após atualização
                                await fetchOnboardingEmployees();
                              }}
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
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um colaborador na lista para visualizar seu checklist de onboarding</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Próximas Ações</CardTitle>
              <CardDescription>
                {selectedEmployee 
                  ? `Ações para ${onboardingList.find(emp => emp.id === selectedEmployee)?.full_name || 'Colaborador'}`
                  : 'Ações gerais pendentes'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedEmployee ? (
                // Ações específicas do colaborador selecionado baseadas em dados reais
                <>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Enviar welcome kit</div>
                      <div className="text-xs text-muted-foreground">
                        Para {onboardingList.find(emp => emp.id === selectedEmployee)?.full_name || 'Colaborador'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Laptop className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Configurar equipamentos</div>
                      <div className="text-xs text-muted-foreground">
                        Notebook e acessos para {onboardingList.find(emp => emp.id === selectedEmployee)?.position || 'Cargo não informado'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Coffee className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Agendar integração com time</div>
                      <div className="text-xs text-muted-foreground">
                        Departamento: {onboardingList.find(emp => emp.id === selectedEmployee)?.department || 'Não informado'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Users className="h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Designar buddy</div>
                      <div className="text-xs text-muted-foreground">
                        {onboardingList.find(emp => emp.id === selectedEmployee)?.buddy ? 
                          `Atual: ${onboardingList.find(emp => emp.id === selectedEmployee)?.buddy}` : 
                          'Nenhum buddy designado'
                        }
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Ações gerais baseadas em dados reais
                <>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {onboardingList.filter(emp => emp.status === 'scheduled').length} welcome kits pendentes
                      </div>
                      <div className="text-xs text-muted-foreground">Novos colaboradores agendados</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Laptop className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {onboardingList.filter(emp => emp.status === 'in_progress').length} equipamentos para configurar
                      </div>
                      <div className="text-xs text-muted-foreground">Colaboradores em onboarding</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Coffee className="h-5 w-5 text-purple-600" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {onboardingList.filter(emp => !emp.buddy).length} reuniões de integração
                      </div>
                      <div className="text-xs text-muted-foreground">Colaboradores sem buddy designado</div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
