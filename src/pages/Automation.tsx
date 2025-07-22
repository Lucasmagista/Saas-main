
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Plus, Play, Pause, Settings, Zap, Mail, MessageCircle, ShoppingCart, Users, Calendar, TrendingUp, Bot, Workflow, Timer, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BotManagement } from "@/components/automation/BotManagement";

const Automation = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("workflows");

  const workflows = [
    {
      id: 1,
      name: "Boas-vindas Novos Clientes",
      description: "Sequência automatizada de emails para novos clientes",
      status: "active",
      triggers: 247,
      success_rate: 94,
      type: "email",
      last_run: "2 min atrás",
      steps: 5,
      icon: <Mail className="w-5 h-5" />
    },
    {
      id: 2,
      name: "Carrinho Abandonado",
      description: "Recuperação automática de carrinhos abandonados",
      status: "active",
      triggers: 89,
      success_rate: 76,
      type: "ecommerce",
      last_run: "15 min atrás",
      steps: 3,
      icon: <ShoppingCart className="w-5 h-5" />
    },
    {
      id: 3,
      name: "Follow-up Pós-Venda",
      description: "Acompanhamento automático após compras",
      status: "paused",
      triggers: 156,
      success_rate: 88,
      type: "customer",
      last_run: "1 hora atrás",
      steps: 4,
      icon: <Users className="w-5 h-5" />
    },
    {
      id: 4,
      name: "Chatbot Atendimento",
      description: "IA para primeiro atendimento ao cliente",
      status: "active",
      triggers: 1247,
      success_rate: 92,
      type: "ai",
      last_run: "30 seg atrás",
      steps: 8,
      icon: <Bot className="w-5 h-5" />
    }
  ];

  const campaigns = [
    {
      id: 1,
      name: "Black Friday 2024",
      type: "Promoção",
      status: "scheduled",
      audience: 2456,
      sent: 0,
      open_rate: 0,
      click_rate: 0,
      schedule: "25/11/2024 08:00"
    },
    {
      id: 2,
      name: "Newsletter Mensal",
      type: "Newsletter",
      status: "active",
      audience: 5467,
      sent: 5467,
      open_rate: 28.5,
      click_rate: 8.2,
      schedule: "Mensal"
    },
    {
      id: 3,
      name: "Feedback Produto",
      type: "Pesquisa",
      status: "completed",
      audience: 892,
      sent: 892,
      open_rate: 45.2,
      click_rate: 23.1,
      schedule: "Concluída"
    }
  ];

  const chatbots = [
    {
      id: 1,
      name: "Atendimento Geral",
      status: "active",
      conversations: 1247,
      resolution_rate: 89,
      avg_response: "2.3s",
      languages: ["Português", "Inglês"],
      integrations: ["WhatsApp", "Telegram", "Website"]
    },
    {
      id: 2,
      name: "Suporte Técnico",
      status: "active",
      conversations: 456,
      resolution_rate: 76,
      avg_response: "3.1s",
      languages: ["Português"],
      integrations: ["Email", "Website"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="w-4 h-4" />;
      case "ecommerce":
        return <ShoppingCart className="w-4 h-4" />;
      case "customer":
        return <Users className="w-4 h-4" />;
      case "ai":
        return <Bot className="w-4 h-4" />;
      default:
        return <Workflow className="w-4 h-4" />;
    }
  };

  const toggleWorkflow = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    toast({
      title: `Workflow ${newStatus === "active" ? "ativado" : "pausado"}`,
      description: `O workflow foi ${newStatus === "active" ? "ativado" : "pausado"} com sucesso.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Automação & IA</h1>
            <p className="text-gray-600 mt-1">Automatize processos e integre inteligência artificial</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <Bot className="w-4 h-4 mr-2" />
              IA Assistant
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Automação
            </Button>
          </div>
        </div>

        {/* Automation Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Workflows Ativos</p>
                  <p className="text-2xl font-bold">12</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+3 este mês</span>
                  </div>
                </div>
                <Workflow className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Execuções Hoje</p>
                  <p className="text-2xl font-bold">1,847</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">+15.2%</span>
                  </div>
                </div>
                <Zap className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Taxa de Sucesso</p>
                  <p className="text-2xl font-bold">94.2%</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">Excelente</span>
                  </div>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100">Tempo Economizado</p>
                  <p className="text-2xl font-bold">847h</p>
                  <div className="flex items-center mt-1">
                    <Timer className="w-4 h-4 mr-1" />
                    <span className="text-sm">Este mês</span>
                  </div>
                </div>
                <Timer className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="workflows">Workflows</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="chatbots">Chatbots IA</TabsTrigger>
            <TabsTrigger value="bots">Gerenciar Bots</TabsTrigger>
          </TabsList>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Workflows de Automação</CardTitle>
                <CardDescription>Gerencie seus workflows automatizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="p-6 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            {workflow.icon}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{workflow.name}</h3>
                            <p className="text-sm text-gray-600">{workflow.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(workflow.status)}>
                            {workflow.status === "active" ? "Ativo" : "Pausado"}
                          </Badge>
                          <Switch 
                            checked={workflow.status === "active"}
                            onCheckedChange={() => toggleWorkflow(workflow.id, workflow.status)}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Execuções</p>
                          <p className="font-semibold">{workflow.triggers}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Taxa de Sucesso</p>
                          <p className="font-semibold text-green-600">{workflow.success_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Etapas</p>
                          <p className="font-semibold">{workflow.steps}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Última Execução</p>
                          <p className="font-semibold">{workflow.last_run}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Progress value={workflow.success_rate} className="flex-1 mr-4" />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            {workflow.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campanhas de Marketing</CardTitle>
                <CardDescription>Gerencie suas campanhas automatizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-6 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                          <p className="text-sm text-gray-600">{campaign.type}</p>
                        </div>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status === "scheduled" ? "Agendada" : 
                           campaign.status === "active" ? "Ativa" : "Concluída"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Audiência</p>
                          <p className="font-semibold">{campaign.audience.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Enviados</p>
                          <p className="font-semibold">{campaign.sent.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Taxa de Abertura</p>
                          <p className="font-semibold text-blue-600">{campaign.open_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Taxa de Clique</p>
                          <p className="font-semibold text-green-600">{campaign.click_rate}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Agendamento</p>
                          <p className="font-semibold">{campaign.schedule}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chatbots Tab */}
          <TabsContent value="chatbots" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chatbots com IA</CardTitle>
                <CardDescription>Assistentes virtuais inteligentes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {chatbots.map((chatbot) => (
                    <div key={chatbot.id} className="p-6 border rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Bot className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{chatbot.name}</h3>
                            <Badge className={getStatusColor(chatbot.status)}>
                              {chatbot.status === "active" ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>
                        <Switch checked={chatbot.status === "active"} />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Conversas</p>
                            <p className="font-semibold">{chatbot.conversations}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Resolução</p>
                            <p className="font-semibold text-green-600">{chatbot.resolution_rate}%</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Resposta</p>
                            <p className="font-semibold">{chatbot.avg_response}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Idiomas</p>
                          <div className="flex gap-2">
                            {chatbot.languages.map((lang, index) => (
                              <Badge key={index} variant="outline">{lang}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500 mb-2">Integrações</p>
                          <div className="flex gap-2">
                            {chatbot.integrations.map((integration, index) => (
                              <Badge key={index} variant="secondary">{integration}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bot Management Tab */}
          <TabsContent value="bots" className="space-y-6">
            <BotManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Automation;
