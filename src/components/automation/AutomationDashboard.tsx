
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Bot, 
  Zap, 
  MessageSquare, 
  Clock, 
  Target,
  Settings,
  BarChart3,
  Users,
  Code,
  Workflow
} from 'lucide-react';
import { 
  useAutomationRules, 
  useCreateAutomationRule, 
  useUpdateAutomationRule,
  useChatbots,
  useCreateChatbot,
  useUpdateChatbot
} from '@/hooks/useAutomation';
import { useAuth } from '@/hooks/useAuth';

export const AutomationDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('rules');
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isCreateBotOpen, setIsCreateBotOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    trigger_type: 'keyword',
    trigger_conditions: {},
    action_type: 'send_message',
    action_config: {},
    priority: 1,
    is_active: true,
  });
  const [newBot, setNewBot] = useState({
    name: '',
    description: '',
    channel: 'whatsapp',
    config: {},
    knowledge_base: {},
    is_active: true,
  });

  const { data: rules, isLoading: rulesLoading } = useAutomationRules();
  const { data: chatbots, isLoading: botsLoading } = useChatbots();
  const createRule = useCreateAutomationRule();
  const updateRule = useUpdateAutomationRule();
  const createBot = useCreateChatbot();
  const updateBot = useUpdateChatbot();

  // Debug console logs
  console.log('AutomationDashboard renderizado:', {
    user: user?.id,
    isCreateRuleOpen,
    rulesLoading,
    botsLoading,
    rulesCount: rules?.length,
    chatbotsCount: chatbots?.length
  });

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      await createRule.mutateAsync({
        ...newRule,
        organization_id: user.organization_id || '00000000-0000-0000-0000-000000000000', // Default organization if not set
        created_by: user.id,
      });
      
      setIsCreateRuleOpen(false);
      setNewRule({
        name: '',
        trigger_type: 'keyword',
        trigger_conditions: {},
        action_type: 'send_message',
        action_config: {},
        priority: 1,
        is_active: true,
      });
    } catch (error) {
      console.error('Erro ao criar regra:', error);
    }
  };

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      console.error('Usuário não autenticado');
      return;
    }
    
    try {
      await createBot.mutateAsync({
        ...newBot,
        organization_id: user.organization_id || '00000000-0000-0000-0000-000000000000', // Default organization if not set
        created_by: user.id,
      });
      
      setIsCreateBotOpen(false);
      setNewBot({
        name: '',
        description: '',
        channel: 'whatsapp',
        config: {},
        knowledge_base: {},
        is_active: true,
      });
    } catch (error) {
      console.error('Erro ao criar chatbot:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await updateRule.mutateAsync({
        id: ruleId,
        is_active: isActive,
      });
    } catch (error) {
      console.error('Erro ao atualizar regra:', error);
    }
  };

  const handleToggleBot = async (botId: string, isActive: boolean) => {
    try {
      await updateBot.mutateAsync({
        id: botId,
        is_active: isActive,
      });
    } catch (error) {
      console.error('Erro ao atualizar chatbot:', error);
    }
  };

  const getTriggerIcon = (type: string) => {
    switch (type) {
      case 'keyword':
        return <MessageSquare className="w-4 h-4" />;
      case 'time_based':
        return <Clock className="w-4 h-4" />;
      case 'event_based':
        return <Target className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'send_message':
        return <MessageSquare className="w-4 h-4" />;
      case 'assign_agent':
        return <Users className="w-4 h-4" />;
      case 'create_lead':
        return <Plus className="w-4 h-4" />;
      case 'webhook':
        return <Code className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  const triggerTypes = [
    { value: 'keyword', label: 'Palavra-chave' },
    { value: 'time_based', label: 'Baseado em tempo' },
    { value: 'event_based', label: 'Baseado em evento' },
  ];

  const actionTypes = [
    { value: 'send_message', label: 'Enviar mensagem' },
    { value: 'assign_agent', label: 'Atribuir agente' },
    { value: 'create_lead', label: 'Criar lead' },
    { value: 'webhook', label: 'Webhook' },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Automação</h1>
        <div className="flex gap-2">
          {/* Botão de teste para debug */}
          <Button 
            variant="secondary" 
            onClick={() => {
              console.log('Estado atual:', isCreateRuleOpen);
              setIsCreateRuleOpen(!isCreateRuleOpen);
              console.log('Novo estado:', !isCreateRuleOpen);
            }}
          >
            Debug: {isCreateRuleOpen ? 'Fechar' : 'Abrir'} Dialog
          </Button>
          
          <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                onClick={() => {
                  console.log('Botão Nova Regra clicado!');
                  setIsCreateRuleOpen(true);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-2xl max-h-[90vh] overflow-y-auto z-[9999]"
              style={{ zIndex: 9999 }}
            >
              <DialogHeader>
                <DialogTitle>Criar Regra de Automação</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRule}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Regra</Label>
                    <Input
                      id="name"
                      value={newRule.name}
                      onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="trigger_type">Tipo de Gatilho</Label>
                      <Select value={newRule.trigger_type} onValueChange={(value) => setNewRule({ ...newRule, trigger_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {triggerTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="action_type">Tipo de Ação</Label>
                      <Select value={newRule.action_type} onValueChange={(value) => setNewRule({ ...newRule, action_type: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {actionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="trigger_conditions">Condições do Gatilho (JSON)</Label>
                    <Textarea
                      id="trigger_conditions"
                      value={JSON.stringify(newRule.trigger_conditions, null, 2)}
                      onChange={(e) => {
                        try {
                          const conditions = JSON.parse(e.target.value);
                          setNewRule({ ...newRule, trigger_conditions: conditions });
                        } catch {
                          // Keep current value if JSON is invalid
                        }
                      }}
                      placeholder='{"keywords": ["oi", "olá"], "case_sensitive": false}'
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="action_config">Configuração da Ação (JSON)</Label>
                    <Textarea
                      id="action_config"
                      value={JSON.stringify(newRule.action_config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          setNewRule({ ...newRule, action_config: config });
                        } catch {
                          // Keep current value if JSON is invalid
                        }
                      }}
                      placeholder='{"message": "Olá! Como posso ajudar?", "delay": 1000}'
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Prioridade</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        max="10"
                        value={newRule.priority}
                        onChange={(e) => setNewRule({ ...newRule, priority: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-6">
                      <Switch
                        id="active"
                        checked={newRule.is_active}
                        onCheckedChange={(checked) => setNewRule({ ...newRule, is_active: checked })}
                      />
                      <Label htmlFor="active">Regra ativa</Label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateRuleOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createRule.isPending}>
                    Criar Regra
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateBotOpen} onOpenChange={setIsCreateBotOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Chatbot
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Chatbot</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateBot}>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bot_name">Nome do Chatbot</Label>
                      <Input
                        id="bot_name"
                        value={newBot.name}
                        onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="channel">Canal</Label>
                      <Select value={newBot.channel} onValueChange={(value) => setNewBot({ ...newBot, channel: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="telegram">Telegram</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="bot_description">Descrição</Label>
                    <Textarea
                      id="bot_description"
                      value={newBot.description}
                      onChange={(e) => setNewBot({ ...newBot, description: e.target.value })}
                      placeholder="Descreva o propósito e funcionalidades do chatbot"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bot_config">Configuração (JSON)</Label>
                    <Textarea
                      id="bot_config"
                      value={JSON.stringify(newBot.config, null, 2)}
                      onChange={(e) => {
                        try {
                          const config = JSON.parse(e.target.value);
                          setNewBot({ ...newBot, config });
                        } catch {
                          // Keep current value if JSON is invalid
                        }
                      }}
                      placeholder='{"greeting": "Olá! Sou um chatbot.", "fallback": "Não entendi. Pode reformular?"}'
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="knowledge_base">Base de Conhecimento (JSON)</Label>
                    <Textarea
                      id="knowledge_base"
                      value={JSON.stringify(newBot.knowledge_base, null, 2)}
                      onChange={(e) => {
                        try {
                          const knowledge = JSON.parse(e.target.value);
                          setNewBot({ ...newBot, knowledge_base: knowledge });
                        } catch {
                          // Keep current value if JSON is invalid
                        }
                      }}
                      placeholder='{"faq": [], "intents": [], "entities": []}'
                      rows={4}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bot_active"
                      checked={newBot.is_active}
                      onCheckedChange={(checked) => setNewBot({ ...newBot, is_active: checked })}
                    />
                    <Label htmlFor="bot_active">Chatbot ativo</Label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateBotOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createBot.isPending}>
                    Criar Chatbot
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Regras Ativas</p>
                <p className="text-2xl font-bold">{rules?.filter(r => r.is_active).length || 0}</p>
              </div>
              <Workflow className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chatbots Ativos</p>
                <p className="text-2xl font-bold">{chatbots?.filter(b => b.is_active).length || 0}</p>
              </div>
              <Bot className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Execuções</p>
                <p className="text-2xl font-bold">{rules?.reduce((total, rule) => total + (rule.usage_count || 0), 0) || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="rules">Regras de Automação</TabsTrigger>
          <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rules" className="space-y-4">
          {rulesLoading && (
            <div className="text-center py-8">Carregando regras...</div>
          )}
          
          {!rulesLoading && rules?.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Workflow className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma regra criada</h3>
                <p className="text-muted-foreground mb-4">
                  Crie regras de automação para responder automaticamente a mensagens.
                </p>
                <Button onClick={() => setIsCreateRuleOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira regra
                </Button>
              </CardContent>
            </Card>
          )}
          
          {!rulesLoading && rules && rules.length > 0 && (
            <div className="grid gap-4">
              {rules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-accent rounded-lg">
                          {getTriggerIcon(rule.trigger_type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{rule.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              Prioridade {rule.priority}
                            </Badge>
                            <Badge variant={rule.is_active ? "default" : "secondary"}>
                              {rule.is_active ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              {getTriggerIcon(rule.trigger_type)}
                              <span className="capitalize">{rule.trigger_type.replace('_', ' ')}</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              {getActionIcon(rule.action_type)}
                              <span className="capitalize">{rule.action_type.replace('_', ' ')}</span>
                            </div>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Executada {rule.usage_count} vezes
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.is_active}
                          onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                        />
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="chatbots" className="space-y-4">
          {botsLoading && (
            <div className="text-center py-8">Carregando chatbots...</div>
          )}
          
          {!botsLoading && chatbots?.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Bot className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhum chatbot criado</h3>
                <p className="text-muted-foreground mb-4">
                  Crie chatbots inteligentes para automatizar o atendimento.
                </p>
                <Button onClick={() => setIsCreateBotOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro chatbot
                </Button>
              </CardContent>
            </Card>
          )}
          
          {!botsLoading && chatbots && chatbots.length > 0 && (
            <div className="grid gap-4">
              {chatbots.map((bot) => (
                <Card key={bot.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-accent rounded-lg">
                          <Bot className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{bot.name}</h3>
                            <Badge variant="outline" className="text-xs capitalize">
                              {bot.channel}
                            </Badge>
                            <Badge variant={bot.is_active ? "default" : "secondary"}>
                              {bot.is_active ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2">
                            {bot.description || 'Sem descrição'}
                          </p>
                          
                          <div className="text-sm text-muted-foreground">
                            Criado em {new Date(bot.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={bot.is_active}
                          onCheckedChange={(checked) => handleToggleBot(bot.id, checked)}
                        />
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Execuções por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Gráfico de execuções será implementado aqui
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Regras Mais Executadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rules?.slice(0, 5).map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-medium">{rule.name}</span>
                      <Badge variant="outline">{rule.usage_count} execuções</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
