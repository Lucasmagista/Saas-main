
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Filter, Calendar, Users, Target, Clock } from "lucide-react";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const projects = [
    {
      id: 1,
      name: "Sistema de CRM",
      description: "Desenvolvimento do novo sistema de gestão de clientes",
      status: "Em Andamento",
      progress: 75,
      priority: "Alta",
      dueDate: "2024-02-15",
      team: ["AS", "CS", "MO"],
      budget: "R$ 45.000",
      tasks: { total: 24, completed: 18 }
    },
    {
      id: 2,
      name: "App Mobile",
      description: "Aplicativo móvel para vendas externas",
      status: "Planejamento",
      progress: 25,
      priority: "Média",
      dueDate: "2024-03-20",
      team: ["JO", "LS", "RF"],
      budget: "R$ 65.000",
      tasks: { total: 32, completed: 8 }
    },
    {
      id: 3,
      name: "Dashboard Analytics",
      description: "Painel de análise de dados corporativos",
      status: "Concluído",
      progress: 100,
      priority: "Alta",
      dueDate: "2024-01-30",
      team: ["MC", "AS", "JO"],
      budget: "R$ 28.000",
      tasks: { total: 16, completed: 16 }
    },
    {
      id: 4,
      name: "Sistema de Estoque",
      description: "Controle automatizado de inventário",
      status: "Em Andamento",
      progress: 45,
      priority: "Baixa",
      dueDate: "2024-04-10",
      team: ["RF", "LS"],
      budget: "R$ 35.000",
      tasks: { total: 20, completed: 9 }
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800 border-green-200";
      case "Em Andamento": return "bg-blue-100 text-blue-800 border-blue-200";
      case "Planejamento": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Atrasado": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "text-red-600";
      case "Média": return "text-yellow-600";
      case "Baixa": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Projetos</h1>
            <p className="text-gray-600 mt-1">Acompanhe o progresso de todos os projetos</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar projetos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Projetos</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
                <Target className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Andamento</p>
                  <p className="text-2xl font-bold text-blue-600">8</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Concluídos</p>
                  <p className="text-2xl font-bold text-green-600">3</p>
                </div>
                <Badge className="bg-green-100 text-green-800">100%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Atrasados</p>
                  <p className="text-2xl font-bold text-red-600">1</p>
                </div>
                <Badge variant="destructive">Atenção</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle>Projetos Ativos</CardTitle>
            <CardDescription>Lista completa de todos os projetos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-6 hover:shadow-md transition-all duration-300 bg-white">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Project Info */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{project.description}</p>
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Orçamento</p>
                          <p className="font-medium">{project.budget}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Prazo</p>
                          <p className="font-medium">{project.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Prioridade</p>
                          <p className={`font-medium ${getPriorityColor(project.priority)}`}>
                            {project.priority}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tarefas</p>
                          <p className="font-medium">{project.tasks.completed}/{project.tasks.total}</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Progresso</span>
                          <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>

                      {/* Team */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Equipe:</span>
                          <div className="flex -space-x-2">
                            {project.team.map((member, index) => (
                              <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                <AvatarFallback className="text-xs">{member}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Projects;
