
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
// Avatar imports removed as team members are not displayed in this view
import { Plus, Search, Filter, Users, Target, Clock } from "lucide-react";
import { useOpportunities } from '@/hooks/useAdvancedCRM';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Buscar oportunidades (projetos) em tempo real via Supabase
  const { data: opportunities } = useOpportunities();

  // Filtrar oportunidades conforme busca
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    return opportunities.filter((opp) => {
      const search = searchTerm.toLowerCase();
      return (
        opp.title?.toLowerCase().includes(search) ||
        opp.description?.toLowerCase().includes(search)
      );
    });
  }, [opportunities, searchTerm]);

  // Estatísticas dinâmicas dos projetos
  const totalProjects = opportunities?.length || 0;
  const completedProjects = opportunities?.filter((opp) => opp.stage === 'Fechado').length || 0;
  const inProgressProjects = opportunities?.filter((opp) => opp.stage !== 'Fechado').length || 0;
  const overdueProjects = opportunities?.filter((opp) => {
    if (!opp.expected_close_date) return false;
    return new Date(opp.expected_close_date) < new Date() && opp.stage !== 'Fechado';
  }).length || 0;

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

        {/* Estatísticas de Projetos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Projetos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
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
                  <p className="text-2xl font-bold text-blue-600">{inProgressProjects}</p>
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
                  <p className="text-2xl font-bold text-green-600">{completedProjects}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Atrasados</p>
                  <p className="text-2xl font-bold text-red-600">{overdueProjects}</p>
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
              {filteredOpportunities.length === 0 ? (
                <p className="text-gray-500">Nenhum projeto encontrado.</p>
              ) : (
                filteredOpportunities.map((opp) => {
                  const statusLabel = opp.stage === 'Fechado' ? 'Concluído' : 'Em Andamento';
                  const progressValue = opp.probability ? opp.probability : 0;
                  const budgetFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(opp.value || 0);
                  const dueDate = opp.expected_close_date ? new Date(opp.expected_close_date).toLocaleDateString('pt-BR') : '—';
                  return (
                    <div key={opp.id} className="border rounded-lg p-6 hover:shadow-md transition-all duration-300 bg-white">
                      <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{opp.title}</h3>
                              <p className="text-gray-600 text-sm mt-1">{opp.description}</p>
                            </div>
                            <Badge className={statusLabel === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {statusLabel}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Valor</p>
                              <p className="font-medium">{budgetFormatted}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Prazo</p>
                              <p className="font-medium">{dueDate}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Probabilidade</p>
                              <p className="font-medium">{progressValue}%</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Lead</p>
                              <p className="font-medium">{opp.lead?.name || '—'}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Progresso</span>
                              <span className="font-medium">{progressValue}%</span>
                            </div>
                            <Progress value={progressValue} className="h-2" />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">Responsável:</span>
                              <span className="text-sm text-gray-900">{opp.assigned_to || '—'}</span>
                            </div>
                            <Button variant="outline" size="sm">
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Projects;
