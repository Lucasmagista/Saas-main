import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import {
  useAutomationRules,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useChatbots,
  useCreateChatbot,
  useUpdateChatbot
} from '@/hooks/useAutomation';

// Componentes da UI (Shadcn/ui)
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Ícones
import {
  Plus, Bot, MessageSquare, Target, Settings, BarChart3, Workflow, Brain, Sparkles, Send,
  CheckCircle, AlertCircle, Info, Lightbulb, Edit, Copy, RotateCcw, TrendingUp, Activity,
  ChevronDown, Check
} from "lucide-react";

// --- Interfaces ---

interface AssistantTemplate {
  id: string; name: string; description: string;
  category: 'customer_support' | 'sales_assistant' | 'lead_qualifier' | 'appointment_scheduler' | 'faq_bot' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  capabilities: string[]; personality: 'professional' | 'friendly' | 'casual' | 'formal';
  channels: string[]; complexity: 'Simples' | 'Intermediário' | 'Avançado';
  estimatedTime: string; features: string[]; integrations: string[];
}

interface AutomationTemplate {
  id: string; name: string; description: string;
  category: 'customer_service' | 'sales' | 'marketing' | 'operations' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  triggers: string[]; actions: string[]; complexity: 'Simples' | 'Intermediário' | 'Avançado';
  estimatedTime: string; benefits: string[];
}

interface AIAssistantState { isOpen: boolean; }
interface AutomationRule { id: string; name: string; is_active: boolean; usage_count?: number; trigger_type: string; action_type: string; priority: number; }
interface Chatbot { id: string; name: string; description?: string; is_active: boolean; channel: string; created_at: string; }

interface AIModelVersion {
  id: string;
  name: string;
  available: boolean;
}

interface AIModelProvider {
  id: string;
  name: string;
  logo: string;
  docs: string;
  description: string;
  versions: AIModelVersion[];
}

// ============================================================================
// Componente Principal: AutomationAdvanced
// ============================================================================
export const AutomationAdvanced = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principais
  const [activeTab, setActiveTab] = useState('overview');
  const [isCreateAutomationOpen, setIsCreateAutomationOpen] = useState(false);
  const [isCreateAssistantOpen, setIsCreateAssistantOpen] = useState(false);
  const [aiAssistant, setAiAssistant] = useState<AIAssistantState>({ isOpen: false });

  // Hooks para dados
  const { data: rules, isLoading: rulesLoading, refetch: refetchRules } = useAutomationRules();
  const { data: chatbots, isLoading: botsLoading, refetch: refetchBots } = useChatbots();
  const createRule = useCreateAutomationRule();
  const updateRule = useUpdateAutomationRule();
  const createBot = useCreateChatbot();
  const updateBot = useUpdateChatbot();

  // Templates de automação predefinidos robustos
  const automationTemplates: AutomationTemplate[] = [
    {
      id: 'welcome_flow',
      name: 'Fluxo de Boas-vindas Inteligente',
      description: 'Sistema completo de recepção com personalização baseada no perfil do cliente e coleta de dados estratégicos',
      category: 'customer_service',
      icon: MessageSquare,
      triggers: ['keyword', 'new_contact', 'first_message'],
      actions: ['send_message', 'collect_data', 'tag_contact', 'assign_agent'],
      complexity: 'Simples',
      estimatedTime: '5 minutos',
      benefits: ['Melhora primeira impressão', 'Coleta dados automaticamente', 'Segmenta clientes']
    },
    {
      id: 'lead_qualification',
      name: 'Qualificação Avançada de Leads',
      description: 'Sistema de qualificação multi-etapas com scoring automático, integração CRM e distribuição inteligente para equipe de vendas',
      category: 'sales',
      icon: Target,
      triggers: ['webhook', 'form_submission', 'keyword', 'score_threshold'],
      actions: ['create_lead', 'score_calculation', 'assign_agent', 'send_message', 'crm_integration'],
      complexity: 'Intermediário',
      estimatedTime: '15 minutos',
      benefits: ['Aumenta conversão em 35%', 'Automatiza distribuição', 'Integra com CRM']
    },
    {
      id: 'support_escalation',
      name: 'Escalação Inteligente de Suporte',
      description: 'Sistema completo de triagem automática com IA, escalação baseada em urgência, SLA tracking e relatórios em tempo real',
      category: 'customer_service',
      icon: AlertCircle,
      triggers: ['time_based', 'keyword_urgency', 'sentiment_analysis', 'sla_breach'],
      actions: ['assign_agent', 'priority_scoring', 'send_message', 'create_ticket', 'sla_tracking'],
      complexity: 'Avançado',
      estimatedTime: '25 minutos',
      benefits: ['Reduz tempo resposta 60%', 'Melhora satisfação', 'SLA automático']
    },
    {
      id: 'marketing_campaign',
      name: 'Campanha de Marketing Multi-canal',
      description: 'Orquestração completa de campanhas com segmentação dinâmica, A/B testing automático e otimização por IA',
      category: 'marketing',
      icon: TrendingUp,
      triggers: ['time_based', 'event_based', 'behavior_trigger', 'segment_change'],
      actions: ['send_message', 'segment_update', 'ab_testing', 'analytics_tracking', 'conversion_optimization'],
      complexity: 'Avançado',
      estimatedTime: '30 minutos',
      benefits: ['ROI 40% maior', 'Segmentação precisa', 'Otimização automática']
    },
    {
      id: 'abandoned_cart',
      name: 'Recuperação de Carrinho Abandonado',
      description: 'Sequência inteligente de recuperação com personalização dinâmica, ofertas progressivas e análise de comportamento',
      category: 'sales',
      icon: RotateCcw,
      triggers: ['cart_abandonment', 'time_delay', 'behavior_pattern'],
      actions: ['send_sequence', 'dynamic_offers', 'behavior_analysis', 'conversion_tracking'],
      complexity: 'Intermediário',
      estimatedTime: '20 minutos',
      benefits: ['Recupera 25% das vendas', 'Ofertas dinâmicas', 'Analytics detalhado']
    },
    {
      id: 'customer_retention',
      name: 'Retenção e Fidelização Avançada',
      description: 'Sistema preditivo de churn com intervenções automáticas, programa de fidelidade e análise de lifetime value',
      category: 'customer_service',
      icon: Activity,
      triggers: ['churn_prediction', 'engagement_drop', 'milestone_reached'],
      actions: ['retention_campaign', 'loyalty_rewards', 'personalized_offers', 'feedback_collection'],
      complexity: 'Avançado',
      estimatedTime: '35 minutos',
      benefits: ['Reduz churn 45%', 'Aumenta LTV', 'Fidelização automática']
    }
  ];

  // Templates de assistentes de IA robustos e especializados
  const assistantTemplates: AssistantTemplate[] = [
    {
      id: 'customer_support_bot',
      name: 'Assistente de Suporte ao Cliente',
      description: 'Assistente especializado em atendimento 24/7 com conhecimento da base de FAQ, escalação inteligente e coleta de feedback',
      category: 'customer_support',
      icon: Bot,
      capabilities: ['Responder FAQ', 'Escalar para humanos', 'Coletar feedback', 'Resolver problemas básicos'],
      personality: 'professional',
      channels: ['whatsapp', 'webchat', 'telegram'],
      complexity: 'Intermediário',
      estimatedTime: '10 minutos',
      features: ['Base de conhecimento', 'Escalação automática', 'Análise de sentimento', 'Métricas de satisfação'],
      integrations: ['CRM', 'Base de dados', 'Sistema de tickets']
    },
    {
      id: 'sales_assistant_bot',
      name: 'Assistente de Vendas Inteligente',
      description: 'Assistente focado em conversão com qualificação de leads, apresentação de produtos e agendamento de reuniões',
      category: 'sales_assistant',
      icon: Target,
      capabilities: ['Qualificar leads', 'Apresentar produtos', 'Agendar reuniões', 'Calcular propostas'],
      personality: 'friendly',
      channels: ['whatsapp', 'webchat', 'instagram'],
      complexity: 'Avançado',
      estimatedTime: '20 minutos',
      features: ['Scoring de leads', 'Catálogo de produtos', 'Calculadora de preços', 'Agenda integrada'],
      integrations: ['CRM', 'E-commerce', 'Calendário', 'Sistema de pagamentos']
    },
  ];

  // Criar automação a partir de template
  const createAutomationFromTemplate = async (template: AutomationTemplate) => {
    if (!user?.id || !user.organization_id) {
      toast({ title: 'Erro de Autenticação', description: 'Por favor, faça login novamente.', variant: 'destructive' });
      return;
    }
    try {
      const newRule = {
        name: template.name,
        trigger_type: template.triggers[0],
        action_type: template.actions[0],
        priority: template.complexity === 'Avançado' ? 8 : (template.complexity === 'Intermediário' ? 6 : 4),
        is_active: true,
        organization_id: user.organization_id,
        created_by: user.id,
        action_config: {}, // Adicione campos obrigatórios conforme esperado pelo backend
        trigger_conditions: [],
      };
      await createRule.mutateAsync(newRule);
      toast({ title: '🎉 Automação criada com sucesso!', description: `"${template.name}" foi configurada e está ativa.` });
      await refetchRules();
      setIsCreateAutomationOpen(false);
    } catch (error) {
      console.error('Erro ao criar automação:', error);
      toast({ title: 'Erro ao criar automação', description: 'Ocorreu um problema, tente novamente.', variant: 'destructive' });
    }
  };

  // Criar assistente de IA a partir de template
  const createAssistantFromTemplate = async (template: AssistantTemplate) => {
    if (!user?.id || !user.organization_id) {
      toast({ title: 'Erro de Autenticação', description: 'Por favor, faça login novamente.', variant: 'destructive' });
      return;
    }
    try {
      const newBot = {
        name: template.name,
        description: template.description,
        channel: template.channels[0],
        is_active: true,
        organization_id: user.organization_id,
        created_by: user.id,
        config: {
            template_id: template.id,
            personality: template.personality,
            capabilities: template.capabilities,
        },
        knowledge_base: {}, // Adiciona knowledge_base obrigatório
      };
      await createBot.mutateAsync(newBot);
      toast({ title: '🤖 Assistente de IA criado com sucesso!', description: `"${template.name}" foi configurado.` });
      await refetchBots();
      setIsCreateAssistantOpen(false);
    } catch (error) {
      console.error('Erro ao criar assistente de IA:', error);
      toast({ title: 'Erro ao criar assistente de IA', description: 'Ocorreu um problema, tente novamente.', variant: 'destructive' });
    }
  };

  // Helper para estilo de complexidade
  const getComplexityStyle = (complexity: string) => {
    switch (complexity) {
      case 'Simples': return 'bg-green-50 text-green-700 border-green-200';
      case 'Intermediário': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  // ============================================================================
  // Subcomponente: Conteúdo do Modal de IA (Aprimorado)
  // ============================================================================
  function AIAssistantModalContent() {
    // --- Estado do Modal ---
    const [availableProviders, setAvailableProviders] = useState<AIModelProvider[]>([]);
    const [selectedModel, setSelectedModel] = useState<{ providerId: string; versionId: string }>({ providerId: '', versionId: '' });
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<Record<string, { role: 'user' | 'assistant', content: string }[]>>({});
    const [loading, setLoading] = useState(false);

    // --- Efeitos ---
    useEffect(() => {
      // Busca real dos provedores/modelos de IA do backend
      const fetchAvailableModels = async () => {
        try {
          const res = await fetch("/api/ai/providers"); // Ajuste a rota conforme seu backend
          if (!res.ok) throw new Error("Erro ao buscar modelos de IA");
          const data: AIModelProvider[] = await res.json();
          setAvailableProviders(data);
          // Define o primeiro modelo disponível como padrão
          const firstAvailable = data.find(p => p.versions.some(v => v.available));
          if (firstAvailable) {
            const firstAvailableVersion = firstAvailable.versions.find(v => v.available);
            if (firstAvailableVersion) {
              setSelectedModel({ providerId: firstAvailable.id, versionId: firstAvailableVersion.id });
            }
          }
        } catch (err) {
          setAvailableProviders([]);
        }
      };
      fetchAvailableModels();
    }, []);

    // --- Lógica do Chat ---
    const historyKey = `${selectedModel.providerId}:${selectedModel.versionId}`;
    const messages = history[historyKey] || [{ role: "assistant", content: "Olá! Sou seu assistente de IA. Como posso ajudar?" }];
    const currentProvider = availableProviders.find(p => p.id === selectedModel.providerId);
    const currentVersion = currentProvider?.versions.find(v => v.id === selectedModel.versionId);

    const handleSelectModel = (providerId: string, versionId: string) => {
        setSelectedModel({ providerId, versionId });
    };

    const sendMessage = async () => {
      if (!input.trim() || !currentVersion?.available) return;

      const newHistory = { ...history };
      const userMsg = { role: "user" as const, content: input };

      if (!newHistory[historyKey]) newHistory[historyKey] = [];
      newHistory[historyKey] = [...newHistory[historyKey], userMsg];
      setHistory(newHistory);
      setLoading(true);
      setInput("");

      try {
        // Chamada real para o backend
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            provider: selectedModel.providerId,
            model: selectedModel.versionId,
            messages: newHistory[historyKey]
          })
        });
        if (!res.ok) throw new Error("Erro ao consultar IA");
        const data = await res.json();
        const aiResponse = data.response || "[Sem resposta da IA]";
        const updatedHistory = { ...newHistory };
        updatedHistory[historyKey] = [...updatedHistory[historyKey], { role: "assistant" as const, content: aiResponse }];
        setHistory(updatedHistory);
      } catch (err) {
        const updatedHistory = { ...newHistory };
        updatedHistory[historyKey] = [...updatedHistory[historyKey], { role: "assistant" as const, content: "Desculpe, ocorreu um erro ao processar sua solicitação." }];
        setHistory(updatedHistory);
      } finally {
        setLoading(false);
      }
    };

    // --- Renderização do Modal ---
    return (
      <div className="flex h-full flex-col lg:flex-row bg-white">
        {/* Sidebar de Seleção de Modelos */}
        <aside className="w-full lg:w-80 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-purple-600" />
                <h2 className="font-bold text-lg">Modelos de IA</h2>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 -mr-2 pr-2">
                {availableProviders.map((provider) => (
                    <Collapsible key={provider.id} className="space-y-1" defaultOpen={provider.id === selectedModel.providerId}>
                        <CollapsibleTrigger asChild>
                            <div className="flex items-center w-full text-left p-2 rounded-md hover:bg-slate-200 transition-colors cursor-pointer group">
                                <img src={provider.logo} alt={provider.name} className="w-5 h-5 rounded mr-3" />
                                <span className="font-semibold flex-1">{provider.name}</span>
                                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:-rotate-180" />
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 pl-4 pt-1">
                            {provider.versions.map((version) => {
                const isSelected = selectedModel.providerId === provider.id && selectedModel.versionId === version.id;
                return (
                  <Button
                    key={version.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => handleSelectModel(provider.id, version.id)}
                    disabled={!version.available}
                  >
                    {isSelected ? <CheckCircle className="h-4 w-4 text-purple-600" /> : <div className="w-4 h-4" />}
                    {version.name}
                    {!version.available && <Badge variant="outline" className="ml-auto">Indisponível</Badge>}
                  </Button>
                );
              })}
                        </CollapsibleContent>
                    </Collapsible>
                ))}
            </div>
        </aside>
        <main className="flex-1 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-end gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <div className={`p-3 rounded-lg shadow-sm ${msg.role === "user" ? "bg-blue-100 text-blue-900" : "bg-white text-gray-900"}`}>
                                <span dangerouslySetInnerHTML={{ __html: msg.content }} />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white"/></div>
                            <div className="bg-white p-3 rounded-lg shadow-sm flex gap-2 items-center">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4 border-t border-slate-200">
                    <div className="relative">
                        <Input
                            placeholder={`Converse com ${currentVersion?.name || 'a IA'}...`}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter" && !loading && input.trim()) { e.preventDefault(); sendMessage(); } }}
                            disabled={loading || !currentVersion?.available}
                            className="pr-12 h-12"
                        />
                        <Button
                            type="button"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={sendMessage}
                            disabled={loading || !input.trim() || !currentVersion?.available}
                        >
                            <Send className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Avançado */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Automação & IA Avançada
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Automatize processos complexos com inteligência artificial e analytics em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="lg" variant="outline" className="relative" onClick={() => setAiAssistant({ isOpen: true })}>
              <Brain className="w-5 h-5 mr-2" />
              IA Assistant
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </Button>
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" onClick={() => setIsCreateAutomationOpen(true)}>
              <Sparkles className="w-5 h-5 mr-2" />
              Nova Automação
            </Button>
          </div>
        </div>

        {/* Dashboard de Estatísticas Avançado com Dados Reais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Regras Ativas</p>
                  <p className="text-3xl font-bold">{rules?.filter(r => r.is_active).length || 0}</p>
                  <p className="text-purple-200 text-xs mt-1">
                    Total de {rules?.length || 0} regras
                  </p>
                </div>
                <Workflow className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">IA Assistants</p>
                  <p className="text-3xl font-bold">{chatbots?.filter(b => b.is_active).length || 0}</p>
                  <p className="text-green-200 text-xs mt-1">
                    Total de {chatbots?.length || 0} assistentes
                  </p>
                </div>
                <Bot className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Execuções</p>
                  <p className="text-3xl font-bold">
                    {rules?.reduce((total: number, rule: AutomationRule) => total + (rule.usage_count || 0), 0) || 0}
                  </p>
                  <p className="text-blue-200 text-xs mt-1">
                    Todas as automações
                  </p>
                </div>
                <Activity className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Status Sistema</p>
                  <p className="text-3xl font-bold">
                    {(rules?.filter(r => r.is_active).length || 0) > 0 ? 'Ativo' : 'Inativo'}
                  </p>
                  <p className="text-orange-200 text-xs mt-1">
                    {(rules?.filter(r => r.is_active).length || 0) > 0 ? 'Operacional' : 'Requer atenção'}
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Principais */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="rules">Automações</TabsTrigger>
            <TabsTrigger value="chatbots">IA Assistants</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Performance em Tempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><span className="text-gray-600">Automações Ativas</span><Badge variant="default" className={(rules?.filter(r => r.is_active).length || 0) > 0 ? "bg-green-500" : "bg-gray-500"}>{rules?.filter(r => r.is_active).length || 0} de {rules?.length || 0}</Badge></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Assistentes Ativos</span><Badge variant="outline">{chatbots?.filter(b => b.is_active).length || 0} de {chatbots?.length || 0}</Badge></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Total Execuções (Hoje)</span><Badge variant="secondary">{rules?.reduce((total: number, rule: AutomationRule) => total + (rule.usage_count || 0), 0) || 0}</Badge></div>
                    <div className="flex justify-between items-center"><span className="text-gray-600">Última Atualização</span><Badge variant="outline">{new Date().toLocaleTimeString()}</Badge></div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Análise do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {!rules || rules.length === 0 ? (
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"><Info className="w-5 h-5 text-blue-500 mt-0.5" /><div className="text-sm"><p className="font-medium">Sistema Pronto para Começar</p><p className="text-gray-600">Crie sua primeira automação ou assistente de IA usando nossos templates.</p></div></div>
                    ) : (
                      <>
                        <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"><CheckCircle className="w-5 h-5 text-green-500 mt-0.5" /><div className="text-sm"><p className="font-medium">Sistema Configurado</p><p className="text-gray-600">{rules.length} automação(ões) no total.</p></div></div>
                        {(rules.filter(r => !r.is_active).length || 0) > 0 && (<div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg"><AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" /><div className="text-sm"><p className="font-medium">Oportunidade de Melhoria</p><p className="text-gray-600">{rules.filter(r => !r.is_active).length} automação(ões) estão inativas.</p></div></div>)}
                      </>
                    )}
                    {!chatbots || chatbots.length === 0 && (<div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"><Info className="w-5 h-5 text-blue-500 mt-0.5" /><div className="text-sm"><p className="font-medium">Potencialize com IA</p><p className="text-gray-600">Crie um assistente de IA para automatizar seu atendimento 24/7.</p></div></div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="mt-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Suas Automações</CardTitle></CardHeader>
                <CardContent>
                    {rulesLoading ? (<div className="text-center py-8">Carregando automações...</div>) : !rules || rules.length === 0 ? (
                        <div className="text-center py-8"><Workflow className="w-16 h-16 mx-auto mb-4 text-gray-400" /><h3 className="text-xl font-semibold mb-2">Nenhuma automação criada</h3><p className="text-gray-600 mb-4">Comece criando sua primeira automação inteligente.</p><Button onClick={() => setIsCreateAutomationOpen(true)}><Plus className="w-4 h-4 mr-2" /> Criar primeira automação</Button></div>
                    ) : (
                        <div className="space-y-4">
                            {rules.map((rule: AutomationRule) => (
                                <Card key={rule.id} className="border hover:shadow-md transition-all"><CardContent className="p-4"><div className="flex items-center justify-between gap-4"><div className="flex-1"><div className="flex items-center gap-3 mb-2"><h3 className="font-semibold text-lg">{rule.name}</h3><Badge variant={rule.is_active ? "default" : "secondary"}>{rule.is_active ? 'Ativa' : 'Inativa'}</Badge><Badge variant="outline">Prioridade {rule.priority}</Badge></div><div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600"><div className="truncate"><span className="font-medium">Gatilho:</span> {rule.trigger_type}</div><div className="truncate"><span className="font-medium">Ação:</span> {rule.action_type}</div><div><span className="font-medium">Execuções:</span> {rule.usage_count || 0}</div></div></div><div className="flex items-center gap-2"><Button variant="ghost" size="sm"><Edit className="w-4 h-4" /></Button><Button variant="ghost" size="sm"><Copy className="w-4 h-4" /></Button><Switch checked={rule.is_active} onCheckedChange={(checked) => updateRule.mutate({ id: rule.id, is_active: checked })} /></div></div></CardContent></Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chatbots" className="mt-6 space-y-6">
            <Card>
                <CardHeader><CardTitle>Seus Assistentes de IA</CardTitle></CardHeader>
                <CardContent>
                    {botsLoading ? (<div className="text-center py-8">Carregando assistentes...</div>) : !chatbots || chatbots.length === 0 ? (
                        <div className="text-center py-8"><Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" /><h3 className="text-xl font-semibold mb-2">Nenhum assistente criado</h3><p className="text-gray-600 mb-4">Crie assistentes de IA para automatizar seu atendimento.</p><Button onClick={() => setIsCreateAssistantOpen(true)}><Plus className="w-4 h-4 mr-2" /> Criar primeiro assistente</Button></div>
                    ) : (
                        <div className="space-y-4">
                            {chatbots.map((bot: Chatbot) => (
                                <Card key={bot.id} className="border hover:shadow-md transition-all"><CardContent className="p-4"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-4 flex-1"><div className="p-3 bg-green-100 rounded-lg"><Bot className="w-6 h-6 text-green-600" /></div><div className="flex-1"><div className="flex items-center gap-3 mb-1"><h3 className="font-semibold text-lg">{bot.name}</h3><Badge variant={bot.is_active ? "default" : "secondary"}>{bot.is_active ? 'Ativo' : 'Inativo'}</Badge><Badge variant="outline" className="capitalize">{bot.channel}</Badge></div><p className="text-gray-600 text-sm">{bot.description || 'Assistente de IA para atendimento automático'}</p><p className="text-xs text-gray-500 mt-1">Criado em {new Date(bot.created_at).toLocaleDateString()}</p></div></div><div className="flex items-center gap-2"><Button variant="ghost" size="sm"><Settings className="w-4 h-4" /></Button><Switch checked={bot.is_active} onCheckedChange={(checked) => updateBot.mutate({ id: bot.id, is_active: checked })} /></div></div></CardContent></Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle>Performance das Automações</CardTitle></CardHeader>
                <CardContent>
                  {rules && rules.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg"><div className="text-2xl font-bold text-green-600">{Math.round((rules.filter(r => r.is_active).length / rules.length) * 100)}%</div><div className="text-sm text-gray-600">Taxa de Ativação</div></div>
                        <div className="p-4 bg-blue-50 rounded-lg"><div className="text-2xl font-bold text-blue-600">{rules.reduce((total: number, rule: AutomationRule) => total + (rule.usage_count || 0), 0)}</div><div className="text-sm text-gray-600">Total Execuções</div></div>
                      </div>
                      <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-medium text-gray-700">Execuções por Automação</h4>
                        {rules.slice(0, 5).map((rule: AutomationRule) => {
                          const maxUsage = Math.max(...(rules.map(r => r.usage_count || 0))) || 1;
                          const percentage = ((rule.usage_count || 0) / maxUsage) * 100;
                          return (<div key={rule.id} className="space-y-1"><div className="flex justify-between text-sm"><span className="truncate">{rule.name}</span><span className="text-gray-600">{rule.usage_count || 0}</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div></div></div>);
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500"><BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-400" /><p>Nenhuma automação para analisar</p><p className="text-sm">Crie automações para visualizar dados</p></div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Top Automações por Uso</CardTitle></CardHeader>
                <CardContent>
                  {rules && rules.length > 0 ? (() => {
                    const sortedRules = [...rules].sort((a: AutomationRule, b: AutomationRule) => (b.usage_count || 0) - (a.usage_count || 0)).slice(0, 5);
                    return (<div className="space-y-3">{sortedRules.map((rule: AutomationRule, index) => (<div key={rule.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-purple-600">{index + 1}</span></div><div><span className="font-medium">{rule.name}</span><div className="flex items-center gap-2 mt-1"><Badge variant={rule.is_active ? "default" : "secondary"} className="text-xs">{rule.is_active ? 'Ativa' : 'Inativa'}</Badge><span className="text-xs text-gray-500">Prioridade {rule.priority}</span></div></div></div><span className="font-bold text-lg text-purple-700">{rule.usage_count || 0}</span></div>))}</div>);
                  })() : (
                    <div className="text-center py-8 text-gray-500"><TrendingUp className="w-12 h-12 mx-auto mb-3 text-gray-400" /><p>Nenhuma automação para ranquear</p><p className="text-sm">Execute automações para ver o ranking</p></div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-6 space-y-6">
            <Card>
              <CardHeader><CardTitle>Templates de Automação</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {automationTemplates.map((template) => (
                    <Card key={template.id} className="hover:shadow-lg transition-all cursor-pointer flex flex-col">
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-4"><div className="p-2 bg-purple-100 rounded-lg"><template.icon className="w-6 h-6 text-purple-600" /></div><div><h3 className="font-semibold">{template.name}</h3><Badge variant="outline" className={`text-xs ${getComplexityStyle(template.complexity)}`}>{template.complexity}</Badge></div></div>
                        <p className="text-gray-600 text-sm mb-4 flex-1">{template.description}</p>
                        <div className="flex flex-wrap gap-1 mb-4">{template.triggers.slice(0, 3).map((trigger) => (<Badge key={trigger} variant="secondary" className="text-xs">{trigger}</Badge>))}{template.triggers.length > 3 && <Badge variant="secondary" className="text-xs">+{template.triggers.length - 3}</Badge>}</div>
                        <Button className="w-full mt-auto" onClick={() => createAutomationFromTemplate(template)} disabled={createRule.isPending}>{createRule.isPending ? (<><RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Criando...</>) : (<><Plus className="w-4 h-4 mr-2" /> Usar Template</>)}</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog: IA Assistant Hub */}
        <Dialog open={aiAssistant.isOpen} onOpenChange={(open) => setAiAssistant({ isOpen: open })}>
          <DialogContent className="max-w-6xl w-full h-[90vh] p-0 overflow-hidden !rounded-lg">
            <DialogTitle className="sr-only">Assistente de IA</DialogTitle>
            <AIAssistantModalContent />
          </DialogContent>
        </Dialog>
        
        {/* Dialog: Nova Automação Avançada */}
        <Dialog open={isCreateAutomationOpen} onOpenChange={setIsCreateAutomationOpen}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl flex items-center gap-3"><Sparkles className="w-8 h-8 text-purple-600" /> Criar Nova Automação Inteligente</DialogTitle>
                    <p className="text-gray-600 mt-2">Escolha um template profissional para começar. Cada um inclui configurações otimizadas e melhores práticas.</p>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {automationTemplates.map((template) => (
                            <Card key={template.id} className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-200 group flex flex-col"><CardContent className="p-6 h-full flex flex-col"><div className="flex items-start gap-3 flex-1 mb-4"><div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl group-hover:from-purple-200 group-hover:to-blue-200 transition-all"><template.icon className="w-7 h-7 text-purple-600" /></div><div className="flex-1"><h3 className="font-bold text-lg leading-tight mb-1">{template.name}</h3><div className="flex items-center gap-2 mb-2"><Badge variant="outline" className={`text-xs ${getComplexityStyle(template.complexity)}`}>{template.complexity}</Badge><Badge variant="secondary" className="text-xs">⏱️ {template.estimatedTime}</Badge></div></div></div><p className="text-gray-600 text-sm mb-4 leading-relaxed flex-1">{template.description}</p><div className="mb-4"><h4 className="font-medium text-sm text-gray-800 mb-2">✨ Principais Benefícios:</h4><div className="space-y-1">{template.benefits.slice(0, 2).map((benefit) => (<div key={benefit} className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle className="w-3 h-3 text-green-500" /><span>{benefit}</span></div>))}{template.benefits.length > 2 && <div className="text-xs text-gray-500">+{template.benefits.length - 2} outros benefícios</div>}</div></div><Button className="w-full mt-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3" onClick={() => createAutomationFromTemplate(template)} disabled={createRule.isPending}>{createRule.isPending ? (<><RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Configurando...</>) : (<><Sparkles className="w-4 h-4 mr-2" /> Implementar Agora</>)}</Button></CardContent></Card>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>

        {/* Dialog: Criar Assistente de IA */}
        <Dialog open={isCreateAssistantOpen} onOpenChange={setIsCreateAssistantOpen}>
            <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-3xl flex items-center gap-3"><Bot className="w-8 h-8 text-green-600" /> Criar Assistente de IA Especializado</DialogTitle>
                    <p className="text-gray-600 mt-2">Escolha um assistente especializado. Cada um é otimizado para tarefas específicas com IA avançada.</p>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {assistantTemplates.map((template) => (
                            <Card key={template.id} className="cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-200 group flex flex-col"><CardContent className="p-6 h-full flex flex-col"><div className="flex items-start gap-3 flex-1 mb-4"><div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all"><template.icon className="w-7 h-7 text-green-600" /></div><div className="flex-1"><h3 className="font-bold text-lg leading-tight mb-1">{template.name}</h3><div className="flex flex-wrap items-center gap-2 mb-2"><Badge variant="outline" className={`text-xs ${getComplexityStyle(template.complexity)}`}>{template.complexity}</Badge><Badge variant="secondary" className="text-xs">⏱️ {template.estimatedTime}</Badge><Badge variant="outline" className="text-xs capitalize">{template.personality}</Badge></div></div></div><p className="text-gray-600 text-sm mb-4 leading-relaxed flex-1">{template.description}</p><div className="mb-4"><h4 className="font-medium text-sm text-gray-800 mb-2">🎯 Capacidades:</h4><div className="space-y-1">{template.capabilities.slice(0, 3).map((capability, index) => (<div key={`cap-${template.id}-${index}`} className="flex items-center gap-2 text-xs text-gray-600"><CheckCircle className="w-3 h-3 text-green-500" /><span>{capability}</span></div>))}{template.capabilities.length > 3 && <div className="text-xs text-gray-500">+{template.capabilities.length - 3} mais</div>}</div></div><Button className="w-full mt-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3" onClick={() => createAssistantFromTemplate(template)} disabled={createBot.isPending}>{createBot.isPending ? (<><RotateCcw className="w-4 h-4 mr-2 animate-spin" /> Criando...</>) : (<><Bot className="w-4 h-4 mr-2" /> Criar Assistente IA</>)}</Button></CardContent></Card>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default AutomationAdvanced;