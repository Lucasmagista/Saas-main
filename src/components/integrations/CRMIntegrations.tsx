import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Database, Users, Tag, TrendingUp, Settings, Zap, FileText, Star, Plus, TestTube, Trash2, RefreshCw, Activity, BarChart3, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CRMConfig = {
  apiKey: string;
  instanceUrl?: string;
  portalId?: string;
  companyDomain?: string;
};

type CRMSystem = {
  id: string;
  name: string;
  status: string;
  contacts: number;
  deals: number;
  revenue: number;
  config: CRMConfig;
};

export function CRMIntegrations() {
  const { toast } = useToast();
  const [crmSystems, setCrmSystems] = useState<CRMSystem[]>([
    { id: "salesforce", name: "Salesforce", status: "connected", contacts: 12543, deals: 234, revenue: 1250000, config: { apiKey: "sf_***", instanceUrl: "https://mycompany.salesforce.com" } },
    { id: "hubspot", name: "HubSpot", status: "connected", contacts: 8932, deals: 156, revenue: 890000, config: { apiKey: "hs_***", portalId: "123456" } },
    { id: "pipedrive", name: "Pipedrive", status: "disconnected", contacts: 0, deals: 0, revenue: 0, config: { apiKey: "", companyDomain: "" } }
  ]);

  const [automationFeatures, setAutomationFeatures] = useState([
    { id: "unified_history", name: "Histórico Unificado", description: "Todas as interações em um local", enabled: true },
    { id: "auto_tags", name: "Tags Automáticas", description: "Baseadas em comportamento", enabled: true },
    { id: "lead_scoring", name: "Lead Scoring", description: "Pontuação automática de leads", enabled: false },
    { id: "sync_contacts", name: "Sincronização de Contatos", description: "Bidirectional sync", enabled: true }
  ]);

  const [leadScoring, setLeadScoring] = useState({
    enabled: false,
    rules: [
      { criteria: "Email aberto", points: 5 },
      { criteria: "Link clicado", points: 10 },
      { criteria: "Formulário preenchido", points: 25 },
      { criteria: "Reunião agendada", points: 50 }
    ]
  });

  const [showCrmConfig, setShowCrmConfig] = useState(false);
  const [showLeadScoring, setShowLeadScoring] = useState(false);
  const [showAddCrm, setShowAddCrm] = useState(false);
  const [configuringCrm, setConfiguringCrm] = useState<CRMSystem | null>(null);
  const [newCrm, setNewCrm] = useState({ type: "", name: "", config: { apiKey: "", instanceUrl: "", portalId: "", companyDomain: "" } });

  const toggleCRM = (id: string) => {
    setCrmSystems(crmSystems.map(crm => 
      crm.id === id 
        ? { ...crm, status: crm.status === "connected" ? "disconnected" : "connected" }
        : crm
    ));

    const crm = crmSystems.find(c => c.id === id);
    toast({
      title: crm?.status === "connected" ? "CRM desconectado" : "CRM conectado",
      description: `${crm?.name} foi ${crm?.status === "connected" ? "desconectado" : "conectado"} com sucesso`
    });
  };

  const toggleFeature = (id: string) => {
    setAutomationFeatures(automationFeatures.map(feature => 
      feature.id === id 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));

    const feature = automationFeatures.find(f => f.id === id);
    toast({
      title: feature?.enabled ? "Recurso desativado" : "Recurso ativado",
      description: `${feature?.name} foi ${feature?.enabled ? 'desativado' : 'ativado'} com sucesso`
    });
  };

  const addCrm = () => {
    if (!newCrm.type || !newCrm.name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const crmConfig: CRMConfig = { apiKey: newCrm.config.apiKey || "" };
    
    if (newCrm.type === 'salesforce') {
      crmConfig.instanceUrl = newCrm.config.instanceUrl || "";
    } else if (newCrm.type === 'hubspot') {
      crmConfig.portalId = newCrm.config.portalId || "";
    } else if (newCrm.type === 'pipedrive') {
      crmConfig.companyDomain = newCrm.config.companyDomain || "";
    }

    const crm: CRMSystem = {
      id: newCrm.type.toLowerCase(),
      name: newCrm.name,
      status: "pending",
      contacts: 0,
      deals: 0,
      revenue: 0,
      config: crmConfig
    };

    setCrmSystems([...crmSystems, crm]);
    setNewCrm({ type: "", name: "", config: { apiKey: "", instanceUrl: "", portalId: "", companyDomain: "" } });
    setShowAddCrm(false);
    
    toast({
      title: "CRM adicionado",
      description: `${crm.name} foi adicionado com sucesso`
    });
  };

  const configureCrm = (crm: CRMSystem) => {
    setConfiguringCrm({ ...crm });
    setShowCrmConfig(true);
  };

  const saveCrmConfig = () => {
    if (!configuringCrm) return;

    setCrmSystems(crmSystems.map(crm =>
      crm.id === configuringCrm.id
        ? { ...crm, config: configuringCrm.config }
        : crm
    ));
    
    setConfiguringCrm(null);
    setShowCrmConfig(false);
    
    toast({
      title: "Configuração salva",
      description: "CRM configurado com sucesso"
    });
  };

  const testConnection = async (crm: CRMSystem) => {
    toast({
      title: "Testando conexão",
      description: `Verificando configurações do ${crm.name}...`
    });

    // Simula teste de conexão
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      if (success) {
        setCrmSystems(crmSystems.map(c =>
          c.id === crm.id
            ? { ...c, status: "connected" }
            : c
        ));
      }

      toast({
        title: success ? "Conexão bem-sucedida" : "Erro na conexão",
        description: success ? "CRM configurado corretamente" : "Verifique suas credenciais",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const syncContacts = (crm: CRMSystem) => {
    toast({
      title: "Sincronizando contatos",
      description: `Sincronizando dados do ${crm.name}...`
    });

    // Simula sincronização
    setTimeout(() => {
      setCrmSystems(crmSystems.map(c =>
        c.id === crm.id
          ? { ...c, contacts: c.contacts + Math.floor(Math.random() * 100) }
          : c
      ));

      toast({
        title: "Sincronização concluída",
        description: "Contatos sincronizados com sucesso"
      });
    }, 3000);
  };

  const deleteCrm = (id: string) => {
    setCrmSystems(crmSystems.filter(c => c.id !== id));
    toast({
      title: "CRM removido",
      description: "CRM foi removido com sucesso"
    });
  };

  const crmIcons = {
    salesforce: <Database className="w-6 h-6" />,
    hubspot: <Zap className="w-6 h-6" />,
    pipedrive: <TrendingUp className="w-6 h-6" />
  };

  const featureIcons = {
    unified_history: <FileText className="w-6 h-6" />,
    auto_tags: <Tag className="w-6 h-6" />,
    lead_scoring: <Star className="w-6 h-6" />,
    sync_contacts: <Users className="w-6 h-6" />
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Integração CRM</CardTitle>
              <CardDescription>Sincronize com sistemas de CRM e configure automações</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowLeadScoring(true)}>
                <Star className="w-4 h-4 mr-2" />
                Lead Scoring
              </Button>
              <Dialog open={showAddCrm} onOpenChange={setShowAddCrm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar CRM
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar CRM</DialogTitle>
                    <DialogDescription>Configure um novo sistema CRM</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="crm-type">Tipo de CRM</Label>
                      <Select value={newCrm.type} onValueChange={(value) => setNewCrm({...newCrm, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o CRM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="salesforce">Salesforce</SelectItem>
                          <SelectItem value="hubspot">HubSpot</SelectItem>
                          <SelectItem value="pipedrive">Pipedrive</SelectItem>
                          <SelectItem value="zoho">Zoho CRM</SelectItem>
                          <SelectItem value="freshsales">Freshsales</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="crm-name">Nome</Label>
                      <Input
                        id="crm-name"
                        value={newCrm.name}
                        onChange={(e) => setNewCrm({...newCrm, name: e.target.value})}
                        placeholder="Nome do CRM"
                      />
                    </div>
                    <Button onClick={addCrm} className="w-full">
                      Adicionar CRM
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="systems">
            <TabsList>
              <TabsTrigger value="systems">Sistemas CRM</TabsTrigger>
              <TabsTrigger value="automation">Automação</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="contacts">Contatos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="systems" className="space-y-4">
              <div className="grid gap-4">
                {crmSystems.map((crm) => (
                  <Card key={crm.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${crm.status === 'connected' ? 'bg-primary' : 'bg-gray-200'} text-white`}>
                            {crmIcons[crm.id as keyof typeof crmIcons]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{crm.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {crm.contacts.toLocaleString()} contatos • {crm.deals} deals
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              R$ {(crm.revenue / 1000).toFixed(0)}K
                            </div>
                            <div className="text-xs text-muted-foreground">Revenue</div>
                          </div>
                          <Badge variant={crm.status === 'connected' ? 'default' : 'secondary'}>
                            {crm.status === 'connected' ? 'Conectado' : 'Desconectado'}
                          </Badge>
                          <Switch 
                            checked={crm.status === 'connected'}
                            onCheckedChange={() => toggleCRM(crm.id)}
                          />
                          <Button variant="outline" size="sm" onClick={() => testConnection(crm)}>
                            <TestTube className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => syncContacts(crm)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => configureCrm(crm)}>
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
                                <AlertDialogTitle>Remover CRM</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este CRM? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCrm(crm.id)}>
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
            
            <TabsContent value="automation" className="space-y-4">
              <div className="grid gap-4">
                {automationFeatures.map((feature) => (
                  <Card key={feature.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${feature.enabled ? 'bg-primary' : 'bg-gray-200'} text-white`}>
                            {featureIcons[feature.id as keyof typeof featureIcons]}
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
            </TabsContent>
            
            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Leads Qualificados</p>
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-xs text-green-600">+15% este mês</p>
                      </div>
                      <Star className="w-8 h-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                        <p className="text-2xl font-bold">23.4%</p>
                        <p className="text-xs text-green-600">+2.1% este mês</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Valor Médio Deal</p>
                        <p className="text-2xl font-bold">R$ 4.2K</p>
                        <p className="text-xs text-blue-600">+8% este mês</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Médio Deal</p>
                        <p className="text-2xl font-bold">28 dias</p>
                        <p className="text-xs text-purple-600">-3 dias este mês</p>
                      </div>
                      <Activity className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Pipeline de Vendas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['Prospecção', 'Qualificação', 'Proposta', 'Fechamento'].map((stage, index) => (
                      <div key={stage} className="flex items-center gap-4">
                        <div className="w-24 text-sm font-medium">{stage}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Progress value={[85, 72, 54, 23][index]} className="flex-1" />
                            <span className="text-sm">{[85, 72, 54, 23][index]}%</span>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {[234, 156, 89, 34][index]} deals
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="contacts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Contatos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {crmSystems.filter(crm => crm.status === 'connected').map((crm) => (
                      <div key={crm.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg bg-primary text-white`}>
                            {crmIcons[crm.id as keyof typeof crmIcons]}
                          </div>
                          <div>
                            <h4 className="font-semibold">{crm.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {crm.contacts.toLocaleString()} contatos sincronizados
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => syncContacts(crm)}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sincronizar
                          </Button>
                          <Button variant="outline" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Configuração do CRM */}
      <Dialog open={showCrmConfig} onOpenChange={setShowCrmConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar {configuringCrm?.name}</DialogTitle>
            <DialogDescription>Configure as credenciais do CRM</DialogDescription>
          </DialogHeader>
          {configuringCrm && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="crm-api-key">API Key</Label>
                <Input
                  id="crm-api-key"
                  type="password"
                  value={configuringCrm.config.apiKey || ''}
                  onChange={(e) => setConfiguringCrm({
                    ...configuringCrm,
                    config: { ...configuringCrm.config, apiKey: e.target.value }
                  })}
                />
              </div>
              {configuringCrm.id === 'salesforce' && (
                <div>
                  <Label htmlFor="instance-url">Instance URL</Label>
                  <Input
                    id="instance-url"
                    value={configuringCrm.config.instanceUrl || ''}
                    onChange={(e) => setConfiguringCrm({
                      ...configuringCrm,
                      config: { ...configuringCrm.config, instanceUrl: e.target.value }
                    })}
                  />
                </div>
              )}
              {configuringCrm.id === 'hubspot' && (
                <div>
                  <Label htmlFor="portal-id">Portal ID</Label>
                  <Input
                    id="portal-id"
                    value={configuringCrm.config.portalId || ''}
                    onChange={(e) => setConfiguringCrm({
                      ...configuringCrm,
                      config: { ...configuringCrm.config, portalId: e.target.value }
                    })}
                  />
                </div>
              )}
              <Button onClick={saveCrmConfig} className="w-full">
                Salvar Configuração
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Lead Scoring */}
      <Dialog open={showLeadScoring} onOpenChange={setShowLeadScoring}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Lead Scoring</DialogTitle>
            <DialogDescription>Configure regras de pontuação para leads</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={leadScoring.enabled}
                onCheckedChange={(checked) => setLeadScoring({...leadScoring, enabled: checked})}
              />
              <Label>Ativar Lead Scoring</Label>
            </div>
            
            {leadScoring.enabled && (
              <div className="space-y-3">
                <Label>Regras de Pontuação</Label>
                {leadScoring.rules.map((rule, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={rule.criteria} className="flex-1" readOnly />
                    <Input value={rule.points} className="w-20" readOnly />
                    <span className="text-sm text-muted-foreground">pontos</span>
                  </div>
                ))}
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Regra
                </Button>
              </div>
            )}
            
            <Button onClick={() => setShowLeadScoring(false)} className="w-full">
              Salvar Configuração
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
