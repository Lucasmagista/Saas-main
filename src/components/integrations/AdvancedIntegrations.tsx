import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Zap, Globe, Code, Settings, Plus, Webhook, Activity, Key, ExternalLink, Copy, RefreshCw, Trash2, TestTube, FileText, Download, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdvancedIntegrations() {
  const { toast } = useToast();
  const [zapierWebhook, setZapierWebhook] = useState("");
  const [webhooks, setWebhooks] = useState([
    { id: 1, name: "Novo Cliente", url: "https://hooks.zapier.com/hooks/catch/123456/abc123", events: ["user.created"], active: true, lastTriggered: "2023-12-01" },
    { id: 2, name: "Pagamento Aprovado", url: "https://hooks.zapier.com/hooks/catch/789012/def456", events: ["payment.success"], active: true, lastTriggered: "2023-12-01" },
    { id: 3, name: "Suporte Ticket", url: "https://hooks.zapier.com/hooks/catch/345678/ghi789", events: ["ticket.created"], active: false, lastTriggered: "Never" }
  ]);
  
  const [apiFeatures, setApiFeatures] = useState([
    { id: "sdk", name: "SDK para Desenvolvedores", description: "Kit completo de desenvolvimento", enabled: true },
    { id: "docs", name: "Documentação Interativa", description: "Docs auto-geradas e testáveis", enabled: true },
    { id: "rate_limit", name: "Rate Limiting", description: "Controle de taxa de requisições", enabled: true },
    { id: "jwt", name: "Autenticação JWT", description: "Tokens seguros para API", enabled: true }
  ]);

  const [showAddWebhook, setShowAddWebhook] = useState(false);
  const [showWebhookConfig, setShowWebhookConfig] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);
  const [showSdkDownload, setShowSdkDownload] = useState(false);
  const [configuringWebhook, setConfiguringWebhook] = useState(null);
  const [newWebhook, setNewWebhook] = useState({ name: "", url: "", events: [] });
  const [apiStats, setApiStats] = useState({
    totalRequests: 156789,
    avgResponseTime: 245,
    uptime: 99.9,
    activeTokens: 23
  });

  const triggerZapier = async () => {
    if (!zapierWebhook) {
      toast({
        title: "Erro",
        description: "Insira a URL do webhook do Zapier",
        variant: "destructive"
      });
      return;
    }

    try {
      await fetch(zapierWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          triggered_from: "integration_page",
          test_data: "Integration test successful"
        })
      });

      toast({
        title: "Webhook Enviado",
        description: "Verifique seu Zapier para confirmar o recebimento"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao enviar webhook",
        variant: "destructive"
      });
    }
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
      id: Date.now(),
      name: newWebhook.name,
      url: newWebhook.url,
      events: newWebhook.events,
      active: true,
      lastTriggered: "Never"
    };

    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: "", url: "", events: [] });
    setShowAddWebhook(false);

    toast({
      title: "Webhook criado",
      description: `${webhook.name} foi criado com sucesso`
    });
  };

  const toggleWebhook = (id: number) => {
    setWebhooks(webhooks.map(webhook => 
      webhook.id === id 
        ? { ...webhook, active: !webhook.active }
        : webhook
    ));
  };

  const configureWebhook = (webhook) => {
    setConfiguringWebhook({ ...webhook });
    setShowWebhookConfig(true);
  };

  const saveWebhookConfig = () => {
    if (!configuringWebhook) return;

    setWebhooks(webhooks.map(webhook =>
      webhook.id === configuringWebhook.id
        ? { ...webhook, ...configuringWebhook }
        : webhook
    ));

    setConfiguringWebhook(null);
    setShowWebhookConfig(false);

    toast({
      title: "Webhook atualizado",
      description: "Configurações salvas com sucesso"
    });
  };

  const testWebhook = async (webhook) => {
    toast({
      title: "Testando webhook",
      description: `Enviando teste para ${webhook.name}...`
    });

    try {
      await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          webhook_id: webhook.id
        })
      });

      setWebhooks(webhooks.map(w =>
        w.id === webhook.id
          ? { ...w, lastTriggered: new Date().toISOString() }
          : w
      ));

      toast({
        title: "Webhook testado",
        description: "Teste enviado com sucesso"
      });
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Falha ao testar webhook",
        variant: "destructive"
      });
    }
  };

  const deleteWebhook = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    toast({
      title: "Webhook removido",
      description: "Webhook foi removido com sucesso"
    });
  };

  const toggleFeature = (id: string) => {
    setApiFeatures(apiFeatures.map(feature => 
      feature.id === id 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));

    const feature = apiFeatures.find(f => f.id === id);
    toast({
      title: feature?.enabled ? "Recurso desativado" : "Recurso ativado",
      description: `${feature?.name} foi ${feature?.enabled ? 'desativado' : 'ativado'} com sucesso`
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência"
    });
  };

  const openDocumentation = () => {
    setShowApiDocs(true);
  };

  const downloadSDK = (language) => {
    toast({
      title: "Download iniciado",
      description: `SDK ${language} está sendo baixado`
    });
  };

  const refreshStats = () => {
    setApiStats({
      totalRequests: apiStats.totalRequests + Math.floor(Math.random() * 1000),
      avgResponseTime: Math.max(100, apiStats.avgResponseTime + Math.floor(Math.random() * 50) - 25),
      uptime: Math.min(100, apiStats.uptime + (Math.random() - 0.5) * 0.1),
      activeTokens: apiStats.activeTokens + Math.floor(Math.random() * 3)
    });

    toast({
      title: "Estatísticas atualizadas",
      description: "Dados da API sincronizados"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Integrações Avançadas</CardTitle>
              <CardDescription>Zapier, Webhooks, API própria e automações complexas</CardDescription>
            </div>
            <Button onClick={refreshStats} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar Stats
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="zapier">
            <TabsList>
              <TabsTrigger value="zapier">Zapier/Make</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
              <TabsTrigger value="api">API Própria</TabsTrigger>
              <TabsTrigger value="sdk">SDK</TabsTrigger>
            </TabsList>
            
            <TabsContent value="zapier" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Zapier Integration
                  </CardTitle>
                  <CardDescription>Conecte com mais de 1000 apps via Zapier</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="zapier-webhook">Webhook URL do Zapier</Label>
                    <div className="flex gap-2 mt-2">
                      <Input 
                        id="zapier-webhook"
                        value={zapierWebhook}
                        onChange={(e) => setZapierWebhook(e.target.value)}
                        placeholder="https://hooks.zapier.com/hooks/catch/..."
                      />
                      <Button onClick={triggerZapier}>
                        <Zap className="w-4 h-4 mr-2" />
                        Testar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="w-5 h-5 text-green-500" />
                          <h4 className="font-semibold">Triggers Disponíveis</h4>
                        </div>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Novo cliente cadastrado</li>
                          <li>• Mensagem recebida</li>
                          <li>• Pagamento aprovado</li>
                          <li>• Ticket de suporte criado</li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-5 h-5 text-blue-500" />
                          <h4 className="font-semibold">Apps Populares</h4>
                        </div>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Google Sheets</li>
                          <li>• Slack</li>
                          <li>• Trello</li>
                          <li>• Mailchimp</li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Zaps Ativos</p>
                            <p className="text-2xl font-bold">12</p>
                          </div>
                          <Zap className="w-8 h-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Execuções/mês</p>
                            <p className="text-2xl font-bold">3,456</p>
                          </div>
                          <Activity className="w-8 h-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Sistema de Webhooks</h3>
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
                      <DialogDescription>Configure um novo webhook para receber eventos</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="webhook-name">Nome</Label>
                        <Input
                          id="webhook-name"
                          value={newWebhook.name}
                          onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
                          placeholder="Ex: Notificação de Vendas"
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
                          {['user.created', 'payment.success', 'ticket.created', 'message.received'].map(event => (
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
              
              <div className="grid gap-4">
                {webhooks.map((webhook) => (
                  <Card key={webhook.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${webhook.active ? 'bg-green-500' : 'bg-gray-200'} text-white`}>
                            <Webhook className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{webhook.name}</h4>
                            <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                            <div className="flex gap-1 mt-1">
                              {webhook.events.map((event, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {event}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <Badge variant={webhook.active ? 'default' : 'secondary'}>
                              {webhook.active ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {webhook.lastTriggered === 'Never' ? 'Nunca' : new Date(webhook.lastTriggered).toLocaleString()}
                            </p>
                          </div>
                          <Switch 
                            checked={webhook.active}
                            onCheckedChange={() => toggleWebhook(webhook.id)}
                          />
                          <Button variant="outline" size="sm" onClick={() => testWebhook(webhook)}>
                            <TestTube className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(webhook.url)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => configureWebhook(webhook)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Webhook</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este webhook? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteWebhook(webhook.id)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Requests</p>
                        <p className="text-2xl font-bold">{apiStats.totalRequests.toLocaleString()}</p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Response</p>
                        <p className="text-2xl font-bold">{apiStats.avgResponseTime}ms</p>
                      </div>
                      <Globe className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Uptime</p>
                        <p className="text-2xl font-bold">{apiStats.uptime.toFixed(1)}%</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Tokens</p>
                        <p className="text-2xl font-bold">{apiStats.activeTokens}</p>
                      </div>
                      <Key className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid gap-4">
                {apiFeatures.map((feature) => (
                  <Card key={feature.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-primary' : 'bg-gray-200'} text-white`}>
                            {feature.id === 'sdk' && <Code className="w-5 h-5" />}
                            {feature.id === 'docs' && <Globe className="w-5 h-5" />}
                            {feature.id === 'rate_limit' && <Activity className="w-5 h-5" />}
                            {feature.id === 'jwt' && <Key className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{feature.name}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={feature.enabled ? 'default' : 'secondary'}>
                            {feature.enabled ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Switch 
                            checked={feature.enabled}
                            onCheckedChange={() => toggleFeature(feature.id)}
                          />
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Documentação da API</CardTitle>
                  <CardDescription>Acesse a documentação completa da API</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-auto p-4 justify-start" onClick={openDocumentation}>
                      <div className="text-left">
                        <div className="font-semibold">Guia de Início Rápido</div>
                        <div className="text-sm text-muted-foreground">Configure sua primeira integração</div>
                      </div>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 justify-start" onClick={openDocumentation}>
                      <div className="text-left">
                        <div className="font-semibold">Referência da API</div>
                        <div className="text-sm text-muted-foreground">Documentação completa dos endpoints</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="sdk" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>SDK para Desenvolvedores</CardTitle>
                  <CardDescription>Bibliotecas oficiais para integração</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { name: 'JavaScript', version: '2.1.0', downloads: '12.5K' },
                      { name: 'Python', version: '1.8.3', downloads: '8.2K' },
                      { name: 'PHP', version: '1.5.1', downloads: '6.7K' },
                      { name: 'Java', version: '1.4.2', downloads: '4.1K' },
                      { name: 'C#', version: '1.3.0', downloads: '3.8K' },
                      { name: 'Ruby', version: '1.2.4', downloads: '2.9K' }
                    ].map((sdk) => (
                      <Card key={sdk.name}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold">{sdk.name}</h4>
                              <p className="text-sm text-muted-foreground">v{sdk.version}</p>
                            </div>
                            <Badge variant="outline">{sdk.downloads}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => downloadSDK(sdk.name)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                            <Button variant="outline" size="sm">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Exemplo de Código</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                    <pre className="text-sm">
{`// JavaScript SDK Example
import { IntegrationAPI } from '@suaempresa/sdk';

const api = new IntegrationAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.suaempresa.com'
});

// Enviar mensagem
const response = await api.messages.send({
  to: '+5511999999999',
  message: 'Olá! Como posso ajudar?'
});

console.log('Mensagem enviada:', response);`}
                    </pre>
                  </div>
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm" onClick={() => copyToClipboard('código exemplo')}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Configuração de Webhook */}
      <Dialog open={showWebhookConfig} onOpenChange={setShowWebhookConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Webhook</DialogTitle>
            <DialogDescription>Edite as configurações do webhook</DialogDescription>
          </DialogHeader>
          {configuringWebhook && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="config-name">Nome</Label>
                <Input
                  id="config-name"
                  value={configuringWebhook.name}
                  onChange={(e) => setConfiguringWebhook({...configuringWebhook, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="config-url">URL</Label>
                <Input
                  id="config-url"
                  value={configuringWebhook.url}
                  onChange={(e) => setConfiguringWebhook({...configuringWebhook, url: e.target.value})}
                />
              </div>
              <div>
                <Label>Eventos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['user.created', 'payment.success', 'ticket.created', 'message.received'].map(event => (
                    <Button
                      key={event}
                      variant={configuringWebhook.events.includes(event) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        const newEvents = configuringWebhook.events.includes(event)
                          ? configuringWebhook.events.filter(e => e !== event)
                          : [...configuringWebhook.events, event];
                        setConfiguringWebhook({...configuringWebhook, events: newEvents});
                      }}
                    >
                      {event}
                    </Button>
                  ))}
                </div>
              </div>
              <Button onClick={saveWebhookConfig} className="w-full">
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
            <DialogDescription>Referência completa da API</DialogDescription>
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
              <h4 className="font-semibold mb-2">Autenticação</h4>
              <p className="text-sm text-muted-foreground mb-2">Use o cabeçalho Authorization com seu token:</p>
              <code className="bg-gray-900 text-gray-100 p-2 rounded text-sm block">
                Authorization: Bearer your-api-token
              </code>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
