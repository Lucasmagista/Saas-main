import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Video, Phone, Users, Settings, Plus, Zap, Calendar, Activity, TestTube, Trash2, Copy, ExternalLink, PlayCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CallConfig = {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  clientId?: string;
  clientSecret?: string;
  redirectUri?: string;
  tenantId?: string;
};

type CallProvider = {
  id: string;
  name: string;
  type: string;
  status: string;
  monthlyMinutes?: number;
  usedMinutes?: number;
  monthlyMeetings?: number;
  usedMeetings?: number;
  config: CallConfig;
};

export function VideoCallIntegrations() {
  const { toast } = useToast();
  const [callProviders, setCallProviders] = useState<CallProvider[]>([
    { id: "twilio", name: "Twilio", type: "voice", status: "connected", monthlyMinutes: 1000, usedMinutes: 234, config: { accountSid: "AC123...", authToken: "***", phoneNumber: "+1234567890" } },
    { id: "zoom", name: "Zoom SDK", type: "video", status: "connected", monthlyMeetings: 500, usedMeetings: 89, config: { apiKey: "jwt_***", apiSecret: "***", webhookSecret: "***" } },
    { id: "googlemeet", name: "Google Meet", type: "video", status: "disconnected", monthlyMeetings: 0, usedMeetings: 0, config: { clientId: "", clientSecret: "", redirectUri: "" } },
    { id: "teams", name: "Microsoft Teams", type: "video", status: "pending", monthlyMeetings: 0, usedMeetings: 0, config: { tenantId: "", clientId: "", clientSecret: "" } }
  ]);

  const [newProvider, setNewProvider] = useState({ type: "", name: "", config: {} as CallConfig });
  const [configuringProvider, setConfiguringProvider] = useState<CallProvider | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showProviderConfig, setShowProviderConfig] = useState(false);
  const [showTestCall, setShowTestCall] = useState(false);
  const [testCall, setTestCall] = useState({ type: "voice", to: "", duration: 5 });
  const [activeCall, setActiveCall] = useState(null);

  const providerIcons = {
    twilio: <Phone className="w-6 h-6" />,
    zoom: <Video className="w-6 h-6" />,
    googlemeet: <Video className="w-6 h-6" />,
    teams: <Users className="w-6 h-6" />
  };

  const providerColors = {
    twilio: "bg-red-500",
    zoom: "bg-blue-500",
    googlemeet: "bg-green-500",
    teams: "bg-purple-500"
  };

  const addProvider = () => {
    if (!newProvider.type || !newProvider.name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const provider: CallProvider = {
      id: newProvider.type.toLowerCase(),
      name: newProvider.name,
      type: newProvider.type.includes("voice") ? "voice" : "video",
      status: "pending",
      config: newProvider.config
    };

    if (provider.type === "voice") {
      provider.monthlyMinutes = 1000;
      provider.usedMinutes = 0;
    } else {
      provider.monthlyMeetings = 100;
      provider.usedMeetings = 0;
    }

    setCallProviders([...callProviders, provider]);
    setNewProvider({ type: "", name: "", config: {} });
    setShowAddProvider(false);
    
    toast({
      title: "Provedor adicionado",
      description: `${provider.name} foi adicionado com sucesso`
    });
  };

  const toggleProvider = (id: string) => {
    setCallProviders(callProviders.map(provider => 
      provider.id === id 
        ? { ...provider, status: provider.status === "connected" ? "disconnected" : "connected" }
        : provider
    ));
  };

  const configureProvider = (provider: CallProvider) => {
    setConfiguringProvider({ ...provider });
    setShowProviderConfig(true);
  };

  const saveProviderConfig = () => {
    if (!configuringProvider) return;

    setCallProviders(callProviders.map(provider =>
      provider.id === configuringProvider.id
        ? { ...provider, config: configuringProvider.config }
        : provider
    ));
    
    setConfiguringProvider(null);
    setShowProviderConfig(false);
    
    toast({
      title: "Configuração salva",
      description: "Provedor configurado com sucesso"
    });
  };

  const testConnection = async (provider: CallProvider) => {
    toast({
      title: "Testando conexão",
      description: `Verificando configurações do ${provider.name}...`
    });

    // Simula teste de conexão
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        setCallProviders(callProviders.map(p =>
          p.id === provider.id
            ? { ...p, status: "connected" }
            : p
        ));
      }

      toast({
        title: success ? "Conexão bem-sucedida" : "Erro na conexão",
        description: success ? "Provedor configurado corretamente" : "Verifique suas credenciais",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const startTestCall = () => {
    if (!testCall.to) {
      toast({
        title: "Erro",
        description: "Preencha o destinatário",
        variant: "destructive"
      });
      return;
    }

    setActiveCall({
      id: Date.now(),
      type: testCall.type,
      to: testCall.to,
      status: "connecting",
      startTime: new Date()
    });

    setShowTestCall(false);

    // Simula conexão de chamada
    setTimeout(() => {
      setActiveCall(prev => prev ? { ...prev, status: "connected" } : null);
      toast({
        title: "Chamada conectada",
        description: `Chamada ${testCall.type === 'voice' ? 'de voz' : 'de vídeo'} iniciada`
      });
    }, 2000);
  };

  const endCall = () => {
    if (!activeCall) return;

    setActiveCall(null);
    toast({
      title: "Chamada encerrada",
      description: "Chamada finalizada com sucesso"
    });
  };

  const deleteProvider = (id: string) => {
    setCallProviders(callProviders.filter(p => p.id !== id));
    toast({
      title: "Provedor removido",
      description: "Provedor foi removido com sucesso"
    });
  };

  const copyConfig = (config: CallConfig) => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    toast({
      title: "Copiado!",
      description: "Configuração copiada para a área de transferência"
    });
  };

  const openDocumentation = (providerType: string) => {
    const docs = {
      twilio: "https://www.twilio.com/docs",
      zoom: "https://marketplace.zoom.us/docs/sdk",
      googlemeet: "https://developers.google.com/meet",
      teams: "https://docs.microsoft.com/en-us/microsoftteams/platform/"
    };
    
    window.open(docs[providerType] || "#", "_blank");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chamadas e Vídeo</CardTitle>
              <CardDescription>Configure provedores de chamadas telefônicas e videochamadas</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTestCall(true)}>
                <TestTube className="w-4 h-4 mr-2" />
                Testar Chamada
              </Button>
              <Dialog open={showAddProvider} onOpenChange={setShowAddProvider}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Provedor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Provedor</DialogTitle>
                    <DialogDescription>Configure um novo provedor de chamadas</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="provider-type">Tipo de Provedor</Label>
                      <Select value={newProvider.type} onValueChange={(value) => setNewProvider({...newProvider, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="twilio-voice">Twilio (Voz)</SelectItem>
                          <SelectItem value="zoom-video">Zoom (Vídeo)</SelectItem>
                          <SelectItem value="googlemeet-video">Google Meet (Vídeo)</SelectItem>
                          <SelectItem value="teams-video">Microsoft Teams (Vídeo)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="provider-name">Nome</Label>
                      <Input
                        id="provider-name"
                        value={newProvider.name}
                        onChange={(e) => setNewProvider({...newProvider, name: e.target.value})}
                        placeholder="Nome do provedor"
                      />
                    </div>
                    <Button onClick={addProvider} className="w-full">
                      Adicionar Provedor
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="providers">
            <TabsList>
              <TabsTrigger value="providers">Provedores</TabsTrigger>
              <TabsTrigger value="usage">Uso</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="providers" className="space-y-4">
              <div className="grid gap-4">
                {callProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${providerColors[provider.id as keyof typeof providerColors]} text-white`}>
                            {providerIcons[provider.id as keyof typeof providerIcons]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{provider.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {provider.type === 'voice' ? 
                                `${provider.usedMinutes || 0} / ${provider.monthlyMinutes || 0} min` :
                                `${provider.usedMeetings || 0} / ${provider.monthlyMeetings || 0} reuniões`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {provider.type === 'voice' ? 
                                Math.min(((provider.usedMinutes || 0) / (provider.monthlyMinutes || 1)) * 100, 100).toFixed(0) :
                                Math.min(((provider.usedMeetings || 0) / (provider.monthlyMeetings || 1)) * 100, 100).toFixed(0)
                              }% usado
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ 
                                  width: `${provider.type === 'voice' ? 
                                    Math.min(((provider.usedMinutes || 0) / (provider.monthlyMinutes || 1)) * 100, 100) :
                                    Math.min(((provider.usedMeetings || 0) / (provider.monthlyMeetings || 1)) * 100, 100)
                                  }%` 
                                }}
                              />
                            </div>
                          </div>
                          <Badge variant={provider.status === 'connected' ? 'default' : provider.status === 'pending' ? 'secondary' : 'outline'}>
                            {provider.status === 'connected' ? 'Conectado' : provider.status === 'pending' ? 'Pendente' : 'Desconectado'}
                          </Badge>
                          <Switch 
                            checked={provider.status === 'connected'}
                            onCheckedChange={() => toggleProvider(provider.id)}
                          />
                          <Button variant="outline" size="sm" onClick={() => testConnection(provider)}>
                            <TestTube className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => configureProvider(provider)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => openDocumentation(provider.id)}>
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Provedor</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este provedor? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteProvider(provider.id)}>
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
            
            <TabsContent value="usage" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Minutos de Voz</p>
                        <p className="text-2xl font-bold">234</p>
                        <p className="text-xs text-green-600">+23 este mês</p>
                      </div>
                      <Phone className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Videochamadas</p>
                        <p className="text-2xl font-bold">89</p>
                        <p className="text-xs text-green-600">+12 este mês</p>
                      </div>
                      <Video className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Duração Média</p>
                        <p className="text-2xl font-bold">12:34</p>
                        <p className="text-xs text-blue-600">Por chamada</p>
                      </div>
                      <Activity className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Qualidade</p>
                        <p className="text-2xl font-bold">98%</p>
                        <p className="text-xs text-green-600">Chamadas bem-sucedidas</p>
                      </div>
                      <Zap className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-4">
              <div className="grid gap-4">
                {callProviders.filter(p => p.status === 'connected').map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${providerColors[provider.id as keyof typeof providerColors]} text-white`}>
                            {providerIcons[provider.id as keyof typeof providerIcons]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{provider.name} Webhook</h4>
                            <p className="text-sm text-muted-foreground">
                              Eventos: call.started, call.ended, call.failed
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => copyConfig(provider.config)}>
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => configureProvider(provider)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Chamada Ativa */}
      {activeCall && (
        <Card className="border-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500 text-white">
                  {activeCall.type === 'voice' ? <Phone className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-semibold">Chamada Ativa</h4>
                  <p className="text-sm text-muted-foreground">
                    {activeCall.type === 'voice' ? 'Chamada de voz' : 'Videochamada'} para {activeCall.to}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">
                  {activeCall.status === 'connecting' ? 'Conectando...' : 'Conectado'}
                </Badge>
                <Button variant="destructive" size="sm" onClick={endCall}>
                  Encerrar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Configuração */}
      <Dialog open={showProviderConfig} onOpenChange={setShowProviderConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar {configuringProvider?.name}</DialogTitle>
            <DialogDescription>Configure as credenciais e webhooks</DialogDescription>
          </DialogHeader>
          {configuringProvider && (
            <div className="space-y-4">
              {configuringProvider.id === 'twilio' && (
                <>
                  <div>
                    <Label htmlFor="account-sid">Account SID</Label>
                    <Input
                      id="account-sid"
                      value={configuringProvider.config.accountSid || ''}
                      onChange={(e) => setConfiguringProvider({
                        ...configuringProvider,
                        config: { ...configuringProvider.config, accountSid: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="auth-token">Auth Token</Label>
                    <Input
                      id="auth-token"
                      type="password"
                      value={configuringProvider.config.authToken || ''}
                      onChange={(e) => setConfiguringProvider({
                        ...configuringProvider,
                        config: { ...configuringProvider.config, authToken: e.target.value }
                      })}
                    />
                  </div>
                </>
              )}
              {configuringProvider.id === 'zoom' && (
                <>
                  <div>
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={configuringProvider.config.apiKey || ''}
                      onChange={(e) => setConfiguringProvider({
                        ...configuringProvider,
                        config: { ...configuringProvider.config, apiKey: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-secret">API Secret</Label>
                    <Input
                      id="api-secret"
                      type="password"
                      value={configuringProvider.config.apiSecret || ''}
                      onChange={(e) => setConfiguringProvider({
                        ...configuringProvider,
                        config: { ...configuringProvider.config, apiSecret: e.target.value }
                      })}
                    />
                  </div>
                </>
              )}
              <Button onClick={saveProviderConfig} className="w-full">
                Salvar Configuração
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Teste de Chamada */}
      <Dialog open={showTestCall} onOpenChange={setShowTestCall}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar Chamada</DialogTitle>
            <DialogDescription>Inicie uma chamada de teste</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="call-type">Tipo de Chamada</Label>
              <Select value={testCall.type} onValueChange={(value) => setTestCall({...testCall, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="voice">Chamada de Voz</SelectItem>
                  <SelectItem value="video">Videochamada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="call-to">Para</Label>
              <Input
                id="call-to"
                value={testCall.to}
                onChange={(e) => setTestCall({...testCall, to: e.target.value})}
                placeholder={testCall.type === 'voice' ? '+55 11 99999-9999' : 'email@exemplo.com'}
              />
            </div>
            <div>
              <Label htmlFor="call-duration">Duração (minutos)</Label>
              <Input
                id="call-duration"
                type="number"
                value={testCall.duration}
                onChange={(e) => setTestCall({...testCall, duration: parseInt(e.target.value)})}
                min="1"
                max="60"
              />
            </div>
            <Button onClick={startTestCall} className="w-full">
              <PlayCircle className="w-4 h-4 mr-2" />
              Iniciar Chamada de Teste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
