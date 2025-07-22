import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Key, Zap, Shield, ExternalLink, Copy, RefreshCw, Trash2, Plus, Settings, Activity, FileText, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const IntegrationsSettings = () => {
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState([
    { 
      id: 1, 
      name: "Chave de Produção", 
      key: "sk_live_", 
      masked: "sk_live_••••••••••••3456", 
      created: "15 Jan 2024", 
      lastUsed: "Hoje",
      permissions: ["read", "write"],
      expires: "2024-12-31"
    },
    { 
      id: 2, 
      name: "Chave de Teste", 
      key: "sk_test_", 
      masked: "sk_test_••••••••••••7890", 
      created: "10 Jan 2024", 
      lastUsed: "Ontem",
      permissions: ["read"],
      expires: "2024-12-31"
    },
  ]);

  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "Webhook Principal", url: "https://api.empresa.com/webhook", events: ["user.created", "payment.success"], status: "active" },
    { id: 2, name: "Backup Webhook", url: "https://backup.empresa.com/webhook", events: ["system.alert"], status: "inactive" },
  ]);

  const [integrations, setIntegrations] = useState([
    { id: 1, name: "Slack", description: "Comunicação em equipe", status: "connected", icon: "💬", config: { channel: "#geral", notifications: true } },
    { id: 2, name: "Google Workspace", description: "Produtividade e colaboração", status: "connected", icon: "📧", config: { sync: true, calendar: true } },
    { id: 3, name: "Trello", description: "Gerenciamento de projetos", status: "disconnected", icon: "📋", config: {} },
    { id: 4, name: "GitHub", description: "Controle de versão", status: "connected", icon: "🐙", config: { repos: 5, webhooks: true } },
    { id: 5, name: "Stripe", description: "Pagamentos online", status: "connected", icon: "💳", config: { live: true, webhooks: true } },
    { id: 6, name: "Zoom", description: "Videoconferências", status: "disconnected", icon: "📹", config: {} },
    { id: 7, name: "Microsoft Teams", description: "Colaboração empresarial", status: "disconnected", icon: "👥", config: {} },
    { id: 8, name: "Salesforce", description: "CRM e vendas", status: "disconnected", icon: "☁️", config: {} },
  ]);

  const [showAddApiKey, setShowAddApiKey] = useState(false);
  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [showIntegrationConfig, setShowIntegrationConfig] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [configuringIntegration, setConfiguringIntegration] = useState(null);
  const [newApiKey, setNewApiKey] = useState({ name: "", permissions: [], expires: "" });
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] });

  const generateApiKey = () => {
    if (!newApiKey.name || newApiKey.permissions.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const key = `sk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const apiKey = {
      id: apiKeys.length + 1,
      name: newApiKey.name,
      key: key,
      masked: `${key.slice(0, 8)}••••••••••••${key.slice(-4)}`,
      created: new Date().toLocaleDateString('pt-BR'),
      lastUsed: "Nunca",
      permissions: newApiKey.permissions,
      expires: newApiKey.expires
    };

    setApiKeys([...apiKeys, apiKey]);
    setNewApiKey({ name: "", permissions: [], expires: "" });
    setShowAddApiKey(false);
    
    toast({
      title: "Chave API gerada",
      description: `${apiKey.name} foi criada com sucesso.`,
    });
  };

  const revokeApiKey = (id: number) => {
    setApiKeys(apiKeys.filter(key => key.id !== id));
    toast({
      title: "Chave revogada",
      description: "A chave API foi revogada permanentemente.",
      variant: "destructive",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Chave copiada para a área de transferência.",
    });
  };

  const toggleIntegration = (id: number) => {
    setIntegrations(integrations.map(integration =>
      integration.id === id
        ? { ...integration, status: integration.status === "connected" ? "disconnected" : "connected" }
        : integration
    ));
    
    const integration = integrations.find(i => i.id === id);
    toast({
      title: integration?.status === "connected" ? "Integração desconectada" : "Integração conectada",
      description: `${integration?.name} foi ${integration?.status === "connected" ? "desconectada" : "conectada"} com sucesso.`,
    });
  };

  const configureIntegration = (integration) => {
    setConfiguringIntegration({ ...integration });
    setShowIntegrationConfig(true);
  };

  const saveIntegrationConfig = () => {
    if (!configuringIntegration) return;

    setIntegrations(integrations.map(integration =>
      integration.id === configuringIntegration.id
        ? { ...integration, config: configuringIntegration.config }
        : integration
    ));

    setConfiguringIntegration(null);
    setShowIntegrationConfig(false);

    toast({
      title: "Configuração salva",
      description: "Configurações da integração atualizadas"
    });
  };

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.url || newWebhook.events.length === 0) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const webhook = {
      id: webhooks.length + 1,
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      status: "active"
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", url: "", events: [] });
    setShowAddWebhook(false);

    toast({
      title: "Webhook criado",
      description: `${webhook.name} foi criado com sucesso`
    });
  };

  const testWebhook = (webhook: any) => {
    toast({
      title: "Testando webhook",
      description: `Enviando teste para ${webhook.name}...`
    });

    // Simula teste
    setTimeout(() => {
      toast({
        title: "Webhook testado",
        description: `Teste enviado para ${webhook.name}. Verifique os logs.`,
      });
    }, 2000);
  };

  const configureWebhook = (webhook) => {
    // Implementa configuração do webhook
    toast({
      title: "Configurando webhook",
      description: `Abrindo configurações para ${webhook.name}`
    });
  };

  const deleteWebhook = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast({
      title: "Webhook removido",
      description: "Webhook foi removido com sucesso"
    });
  };

  const openApiDocs = (docType) => {
    setShowApiDocs(true);
    toast({
      title: "Abrindo documentação",
      description: `Carregando ${docType}...`
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="api-keys">Chaves API</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        {/* Integrações */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Integrações Disponíveis
              </CardTitle>
              <CardDescription>Conecte com suas ferramentas favoritas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{integration.icon}</div>
                        <div>
                          <h4 className="font-medium">{integration.name}</h4>
                          <p className="text-sm text-gray-600">{integration.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={integration.status === "connected" ? "default" : "secondary"}
                          className={integration.status === "connected" ? "bg-green-100 text-green-800" : ""}
                        >
                          {integration.status === "connected" ? "Conectado" : "Desconectado"}
                        </Badge>
                        {integration.status === "connected" && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                    
                    {integration.status === "connected" && Object.keys(integration.config).length > 0 && (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-sm font-medium">Configurações:</h5>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {Object.entries(integration.config).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}:</span>
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        variant={integration.status === "connected" ? "outline" : "default"}
                        size="sm"
                        onClick={() => toggleIntegration(integration.id)}
                        className="flex-1"
                      >
                        {integration.status === "connected" ? "Desconectar" : "Conectar"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => configureIntegration(integration)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chaves API */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Chaves de API
                  </CardTitle>
                  <CardDescription>Gerencie suas chaves de acesso à API</CardDescription>
                </div>
                <Dialog open={showAddApiKey} onOpenChange={setShowAddApiKey}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Chave
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Gerar Nova Chave API</DialogTitle>
                      <DialogDescription>Configure uma nova chave de API</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="key-name">Nome da Chave</Label>
                        <Input
                          id="key-name"
                          value={newApiKey.name}
                          onChange={(e) => setNewApiKey({...newApiKey, name: e.target.value})}
                          placeholder="Ex: Chave de Produção"
                        />
                      </div>
                      <div>
                        <Label>Permissões</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['read', 'write', 'delete', 'admin'].map(permission => (
                            <Button
                              key={permission}
                              variant={newApiKey.permissions.includes(permission) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const newPermissions = newApiKey.permissions.includes(permission)
                                  ? newApiKey.permissions.filter(p => p !== permission)
                                  : [...newApiKey.permissions, permission];
                                setNewApiKey({...newApiKey, permissions: newPermissions});
                              }}
                            >
                              {permission.charAt(0).toUpperCase() + permission.slice(1)}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="key-expires">Data de Expiração</Label>
                        <Input
                          id="key-expires"
                          type="date"
                          value={newApiKey.expires}
                          onChange={(e) => setNewApiKey({...newApiKey, expires: e.target.value})}
                        />
                      </div>
                      <Button onClick={generateApiKey} className="w-full">
                        Gerar Chave API
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{apiKey.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>Criado: {apiKey.created}</span>
                          <span>Último uso: {apiKey.lastUsed}</span>
                          {apiKey.permissions && (
                            <div className="flex gap-1">
                              {apiKey.permissions.map(perm => (
                                <Badge key={perm} variant="outline" className="text-xs">
                                  {perm}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(apiKey.key + "exemplo_completo")}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revogar chave API?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. A chave será permanentemente revogada.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => revokeApiKey(apiKey.id)}>
                                Revogar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded font-mono text-sm break-all">
                      {apiKey.masked}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documentação da API */}
          <Card>
            <CardHeader>
              <CardTitle>Documentação da API</CardTitle>
              <CardDescription>Aprenda como usar nossa API</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Guia de Início Rápido</h4>
                  <p className="text-sm text-gray-600 mb-3">Comece a usar nossa API em poucos minutos</p>
                  <Button variant="outline" size="sm" onClick={() => openApiDocs('Guia de Início Rápido')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Guia
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Referência da API</h4>
                  <p className="text-sm text-gray-600 mb-3">Documentação completa de todos os endpoints</p>
                  <Button variant="outline" size="sm" onClick={() => openApiDocs('Referência da API')}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver Referência
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Webhooks</CardTitle>
                  <CardDescription>Configure endpoints para receber eventos em tempo real</CardDescription>
                </div>
                <Dialog open={showAddWebhook} onOpenChange={setShowAddWebhook}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Novo Webhook
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Webhook</DialogTitle>
                      <DialogDescription>Configure um novo webhook</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhook-name">Nome</Label>
                        <Input
                          id="webhook-name"
                          value={newWebhook.name}
                          onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                          placeholder="Ex: Webhook de Pagamentos"
                        />
                      </div>
                      <div>
                        <Label htmlFor="webhook-url">URL</Label>
                        <Input
                          id="webhook-url"
                          value={newWebhook.url}
                          onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
                          placeholder="https://api.suaempresa.com/webhook"
                        />
                      </div>
                      <div>
                        <Label>Eventos</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['user.created', 'payment.success', 'message.sent', 'order.completed'].map(event => (
                            <Button
                              key={event}
                              variant={newWebhook.events.includes(event) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const newEvents = newWebhook.events.includes(event)
                                  ? newWebhook.events.filter(e => e !== event)
                                  : [...newWebhook.events, event];
                                setNewWebhook({...newWebhook, events: newEvents});
                              }}
                            >
                              {event}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <Button onClick={addWebhook} className="w-full">
                        Criar Webhook
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{webhook.name}</h4>
                        <p className="text-sm text-gray-600">{webhook.url}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                          {webhook.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                        <Switch defaultChecked={webhook.status === "active"} />
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <h5 className="text-sm font-medium">Eventos:</h5>
                      <div className="flex flex-wrap gap-1">
                        {webhook.events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => testWebhook(webhook)}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Testar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => configureWebhook(webhook)}>
                        <Settings className="w-4 h-4 mr-2" />
                        Configurar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteWebhook(webhook.id)}>
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Logs de Webhook */}
          <Card>
            <CardHeader>
              <CardTitle>Logs Recentes</CardTitle>
              <CardDescription>Histórico de entrega de webhooks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { event: "user.created", status: "success", time: "Há 5 min", webhook: "Webhook Principal" },
                  { event: "payment.success", status: "success", time: "Há 12 min", webhook: "Webhook Principal" },
                  { event: "system.alert", status: "failed", time: "Há 30 min", webhook: "Backup Webhook" },
                  { event: "user.updated", status: "success", time: "Há 1 hora", webhook: "Webhook Principal" },
                ].map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <span className="font-mono text-sm">{log.event}</span>
                        <p className="text-xs text-gray-600">{log.webhook}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? 'Sucesso' : 'Falha'}
                      </Badge>
                      <p className="text-xs text-gray-600 mt-1">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Configuração de Integração */}
      <Dialog open={showIntegrationConfig} onOpenChange={setShowIntegrationConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar {configuringIntegration?.name}</DialogTitle>
            <DialogDescription>Ajuste as configurações da integração</DialogDescription>
          </DialogHeader>
          {configuringIntegration && (
            <div className="space-y-4">
              <div>
                <Label>Configurações Específicas</Label>
                <div className="space-y-3 mt-2">
                  {Object.entries(configuringIntegration.config).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label className="capitalize">{key}</Label>
                      {typeof value === 'boolean' ? (
                        <Switch 
                          checked={value}
                          onCheckedChange={(checked) => setConfiguringIntegration({
                            ...configuringIntegration,
                            config: { ...configuringIntegration.config, [key]: checked }
                          })}
                        />
                      ) : (
                        <Input
                          value={String(value)}
                          onChange={(e) => setConfiguringIntegration({
                            ...configuringIntegration,
                            config: { ...configuringIntegration.config, [key]: e.target.value }
                          })}
                          className="w-32"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={saveIntegrationConfig} className="w-full">
                Salvar Configuração
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Documentação */}
      <Dialog open={showApiDocs} onOpenChange={setShowApiDocs}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Documentação da API</DialogTitle>
            <DialogDescription>Guia completo para usar nossa API</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Endpoints Principais</h4>
              <div className="space-y-2 text-sm">
                <div><Badge variant="outline">GET</Badge> <code>/api/messages</code> - Listar mensagens</div>
                <div><Badge variant="outline">POST</Badge> <code>/api/messages</code> - Enviar mensagem</div>
                <div><Badge variant="outline">GET</Badge> <code>/api/contacts</code> - Listar contatos</div>
                <div><Badge variant="outline">POST</Badge> <code>/api/webhooks</code> - Criar webhook</div>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Exemplo de Uso</h4>
              <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm">
                <pre>{`curl -X POST https://api.suaempresa.com/messages \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+5511999999999",
    "message": "Olá mundo!"
  }'`}</pre>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
