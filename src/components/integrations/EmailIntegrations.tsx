import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Mail, Send, Cloud, Settings, Plus, BarChart3, Zap, Activity, TestTube, Globe, Trash2, Copy, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type EmailConfig = {
  apiKey: string;
  domain: string;
  verified: boolean;
  region?: string;
};

type EmailProvider = {
  id: string;
  name: string;
  status: string;
  dailyLimit: number;
  sent: number;
  config: EmailConfig;
};

export function EmailIntegrations() {
  const { toast } = useToast();
  const [emailProviders, setEmailProviders] = useState<EmailProvider[]>([
    { id: "sendgrid", name: "SendGrid", status: "connected", dailyLimit: 40000, sent: 12543, config: { apiKey: "SG.***", domain: "empresa.com", verified: true } },
    { id: "mailgun", name: "Mailgun", status: "connected", dailyLimit: 10000, sent: 3421, config: { apiKey: "key-***", domain: "mg.empresa.com", verified: true } },
    { id: "resend", name: "Resend", status: "disconnected", dailyLimit: 0, sent: 0, config: { apiKey: "", domain: "", verified: false } },
    { id: "ses", name: "Amazon SES", status: "disconnected", dailyLimit: 0, sent: 0, config: { apiKey: "", domain: "", region: "us-east-1", verified: false } },
    { id: "mailsend", name: "MailSend", status: "pending", dailyLimit: 5000, sent: 0, config: { apiKey: "ms_***", domain: "empresa.com", verified: false } }
  ]);

  const [newProvider, setNewProvider] = useState({ type: "", apiKey: "", domain: "", region: "" });
  const [configuringProvider, setConfiguringProvider] = useState<EmailProvider | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [showProviderConfig, setShowProviderConfig] = useState(false);
  const [showEmailTest, setShowEmailTest] = useState(false);
  const [testEmail, setTestEmail] = useState({ to: "", subject: "", body: "" });
  const [emailLogs, setEmailLogs] = useState([
    { id: 1, provider: "SendGrid", to: "cliente@empresa.com", subject: "Bem-vindo!", status: "delivered", timestamp: new Date().toISOString() },
    { id: 2, provider: "Mailgun", to: "suporte@empresa.com", subject: "Ticket #123", status: "opened", timestamp: new Date().toISOString() },
    { id: 3, provider: "SendGrid", to: "marketing@empresa.com", subject: "Newsletter", status: "bounced", timestamp: new Date().toISOString() }
  ]);

  const providerIcons = {
    sendgrid: <Send className="w-6 h-6" />,
    mailgun: <Mail className="w-6 h-6" />,
    resend: <Zap className="w-6 h-6" />,
    ses: <Cloud className="w-6 h-6" />,
    mailsend: <Mail className="w-6 h-6" />
  };

  const providerColors = {
    sendgrid: "bg-blue-500",
    mailgun: "bg-red-500",
    resend: "bg-black",
    ses: "bg-orange-500",
    mailsend: "bg-green-500"
  };

  const addProvider = () => {
    if (!newProvider.type || !newProvider.apiKey) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const providerConfig: EmailConfig = {
      apiKey: newProvider.apiKey,
      domain: newProvider.domain,
      verified: false
    };

    if (newProvider.type === "ses") {
      providerConfig.region = newProvider.region || "us-east-1";
    }

    const provider: EmailProvider = {
      id: newProvider.type,
      name: newProvider.type.charAt(0).toUpperCase() + newProvider.type.slice(1),
      status: "pending",
      dailyLimit: 1000,
      sent: 0,
      config: providerConfig
    };

    setEmailProviders([...emailProviders, provider]);
    setNewProvider({ type: "", apiKey: "", domain: "", region: "" });
    setShowAddProvider(false);
    
    toast({
      title: "Provedor adicionado",
      description: `${provider.name} foi configurado com sucesso`
    });
  };

  const toggleProvider = (id: string) => {
    setEmailProviders(emailProviders.map(provider => 
      provider.id === id 
        ? { ...provider, status: provider.status === "connected" ? "disconnected" : "connected" }
        : provider
    ));
  };

  const configureProvider = (provider: EmailProvider) => {
    setConfiguringProvider(provider);
    setShowProviderConfig(true);
  };

  const saveProviderConfig = () => {
    if (!configuringProvider) return;

    setEmailProviders(emailProviders.map(provider =>
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

  const testConnection = async (provider: EmailProvider) => {
    toast({
      title: "Testando conexão",
      description: "Verificando configurações..."
    });

    // Simula teste de conexão
    setTimeout(() => {
      const success = Math.random() > 0.3;
      
      setEmailProviders(emailProviders.map(p =>
        p.id === provider.id
          ? { ...p, config: { ...p.config, verified: success } }
          : p
      ));

      toast({
        title: success ? "Conexão bem-sucedida" : "Erro na conexão",
        description: success ? "Provedor configurado corretamente" : "Verifique suas credenciais",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const sendTestEmail = async () => {
    if (!testEmail.to || !testEmail.subject) {
      toast({
        title: "Erro",
        description: "Preencha os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Simula envio de email
    const newLog = {
      id: Date.now(),
      provider: "SendGrid",
      to: testEmail.to,
      subject: testEmail.subject,
      status: "sent",
      timestamp: new Date().toISOString()
    };

    setEmailLogs([newLog, ...emailLogs]);
    setTestEmail({ to: "", subject: "", body: "" });
    setShowEmailTest(false);

    toast({
      title: "Email enviado",
      description: "Email de teste enviado com sucesso"
    });
  };

  const deleteProvider = (id: string) => {
    setEmailProviders(emailProviders.filter(p => p.id !== id));
    toast({
      title: "Provedor removido",
      description: "Provedor foi removido com sucesso"
    });
  };

  const copyApiKey = (apiKey: string) => {
    navigator.clipboard.writeText(apiKey);
    toast({
      title: "Copiado!",
      description: "API Key copiada para a área de transferência"
    });
  };

  const refreshStats = () => {
    setEmailProviders(emailProviders.map(provider => ({
      ...provider,
      sent: provider.sent + Math.floor(Math.random() * 100)
    })));
    
    toast({
      title: "Estatísticas atualizadas",
      description: "Dados sincronizados com sucesso"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Serviços de Email</CardTitle>
              <CardDescription>Configure provedores de email para envio em massa e transacional</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refreshStats}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
              <Button onClick={() => setShowEmailTest(true)}>
                <TestTube className="w-4 h-4 mr-2" />
                Testar Email
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
                    <DialogTitle>Adicionar Provedor de Email</DialogTitle>
                    <DialogDescription>Configure um novo provedor de email</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="provider-type">Provedor</Label>
                      <Select value={newProvider.type} onValueChange={(value) => setNewProvider({...newProvider, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sendgrid">SendGrid</SelectItem>
                          <SelectItem value="mailgun">Mailgun</SelectItem>
                          <SelectItem value="resend">Resend</SelectItem>
                          <SelectItem value="ses">Amazon SES</SelectItem>
                          <SelectItem value="mailsend">MailSend</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="api-key">API Key</Label>
                      <Input 
                        id="api-key"
                        type="password"
                        value={newProvider.apiKey}
                        onChange={(e) => setNewProvider({...newProvider, apiKey: e.target.value})}
                        placeholder="Cole a API key aqui"
                      />
                    </div>
                    <div>
                      <Label htmlFor="domain">Domínio</Label>
                      <Input 
                        id="domain"
                        value={newProvider.domain}
                        onChange={(e) => setNewProvider({...newProvider, domain: e.target.value})}
                        placeholder="empresa.com"
                      />
                    </div>
                    {newProvider.type === "ses" && (
                      <div>
                        <Label htmlFor="region">Região AWS</Label>
                        <Select value={newProvider.region} onValueChange={(value) => setNewProvider({...newProvider, region: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a região" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                            <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                            <SelectItem value="eu-west-1">Europe (Ireland)</SelectItem>
                            <SelectItem value="sa-east-1">South America (São Paulo)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
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
              <TabsTrigger value="logs">Logs de Entrega</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="providers" className="space-y-4">
              <div className="grid gap-4">
                {emailProviders.map((provider) => (
                  <Card key={provider.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${providerColors[provider.id as keyof typeof providerColors]} text-white`}>
                            {providerIcons[provider.id as keyof typeof providerIcons]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{provider.name}</h4>
                              {provider.config.verified ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {provider.sent.toLocaleString()} / {provider.dailyLimit.toLocaleString()} emails hoje
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {provider.dailyLimit > 0 ? Math.round((provider.sent / provider.dailyLimit) * 100) : 0}% usado
                            </div>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all" 
                                style={{ width: `${provider.dailyLimit > 0 ? Math.min((provider.sent / provider.dailyLimit) * 100, 100) : 0}%` }}
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
            
            <TabsContent value="logs" className="space-y-4">
              <div className="space-y-3">
                {emailLogs.map((log) => (
                  <Card key={log.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            log.status === 'delivered' ? 'bg-green-500' : 
                            log.status === 'sent' ? 'bg-blue-500' :
                            log.status === 'opened' ? 'bg-purple-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{log.subject}</span>
                              <Badge variant="outline">{log.provider}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{log.to}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={log.status === 'delivered' ? 'default' : log.status === 'bounced' ? 'destructive' : 'secondary'}>
                            {log.status === 'delivered' ? 'Entregue' : 
                             log.status === 'sent' ? 'Enviado' :
                             log.status === 'opened' ? 'Aberto' : 'Rejeitado'}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Entrega</p>
                        <p className="text-2xl font-bold">96.4%</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Abertura</p>
                        <p className="text-2xl font-bold">23.8%</p>
                      </div>
                      <Activity className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Enviados</p>
                        <p className="text-2xl font-bold">15,964</p>
                      </div>
                      <Send className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Configuração de Provedor */}
      <Dialog open={showProviderConfig} onOpenChange={setShowProviderConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Provedor</DialogTitle>
            <DialogDescription>Configure as settings do provedor de email</DialogDescription>
          </DialogHeader>
          {configuringProvider && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="config-domain">Domínio</Label>
                <Input
                  id="config-domain"
                  value={configuringProvider.config.domain}
                  onChange={(e) => setConfiguringProvider({
                    ...configuringProvider,
                    config: { ...configuringProvider.config, domain: e.target.value }
                  })}
                />
              </div>
              <div>
                <Label htmlFor="config-apikey">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="config-apikey"
                    type="password"
                    value={configuringProvider.config.apiKey}
                    onChange={(e) => setConfiguringProvider({
                      ...configuringProvider,
                      config: { ...configuringProvider.config, apiKey: e.target.value }
                    })}
                  />
                  <Button variant="outline" onClick={() => copyApiKey(configuringProvider.config.apiKey)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button onClick={saveProviderConfig} className="w-full">
                Salvar Configuração
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Teste de Email */}
      <Dialog open={showEmailTest} onOpenChange={setShowEmailTest}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Testar Envio de Email</DialogTitle>
            <DialogDescription>Envie um email de teste para verificar a configuração</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-email-to">Para</Label>
              <Input
                id="test-email-to"
                type="email"
                value={testEmail.to}
                onChange={(e) => setTestEmail({...testEmail, to: e.target.value})}
                placeholder="destinatario@exemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="test-email-subject">Assunto</Label>
              <Input
                id="test-email-subject"
                value={testEmail.subject}
                onChange={(e) => setTestEmail({...testEmail, subject: e.target.value})}
                placeholder="Assunto do email de teste"
              />
            </div>
            <div>
              <Label htmlFor="test-email-body">Mensagem</Label>
              <Textarea
                id="test-email-body"
                value={testEmail.body}
                onChange={(e) => setTestEmail({...testEmail, body: e.target.value})}
                placeholder="Conteúdo do email de teste..."
                rows={4}
              />
            </div>
            <Button onClick={sendTestEmail} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              Enviar Email de Teste
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
