
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
  Settings, 
  Zap, 
  Globe, 
  Database, 
  Webhook,
  Play,
  Pause,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Code,
  Key
} from 'lucide-react';
import { 
  useIntegrations, 
  useCreateIntegration, 
  useUpdateIntegration, 
  useSyncIntegration,
  useWebhookEvents 
} from '@/hooks/useIntegrations';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const IntegrationsManager = () => {
  const [activeTab, setActiveTab] = useState('integrations');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'api',
    config: {},
    credentials: {},
    is_active: true,
  });

  const { data: integrations, isLoading } = useIntegrations();
  const { data: webhookEvents } = useWebhookEvents();
  const createIntegration = useCreateIntegration();
  const updateIntegration = useUpdateIntegration();
  const syncIntegration = useSyncIntegration();

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'api':
        return <Code className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      case 'database':
        return <Database className="w-4 h-4" />;
      case 'zapier':
        return <Zap className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleCreateIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createIntegration.mutateAsync({
        ...newIntegration,
        organization_id: 'temp-org-id',
        created_by: 'temp-user-id',
      });
      
      setIsCreateDialogOpen(false);
      setNewIntegration({
        name: '',
        type: 'api',
        config: {},
        credentials: {},
        is_active: true,
      });
    } catch (error) {
      console.error('Erro ao criar integração:', error);
    }
  };

  const handleToggleIntegration = async (integrationId: string, isActive: boolean) => {
    try {
      await updateIntegration.mutateAsync({
        id: integrationId,
        is_active: isActive,
      });
    } catch (error) {
      console.error('Erro ao atualizar integração:', error);
    }
  };

  const handleSyncIntegration = async (integrationId: string) => {
    try {
      await syncIntegration.mutateAsync(integrationId);
    } catch (error) {
      console.error('Erro ao sincronizar integração:', error);
    }
  };

  const integrationTypes = [
    { value: 'api', label: 'API REST', icon: Code },
    { value: 'webhook', label: 'Webhook', icon: Webhook },
    { value: 'database', label: 'Database', icon: Database },
    { value: 'zapier', label: 'Zapier', icon: Zap },
    { value: 'other', label: 'Outros', icon: Globe },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Integrações</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Integração
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Criar Integração</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateIntegration}>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={newIntegration.name}
                      onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Tipo</Label>
                    <Select value={newIntegration.type} onValueChange={(value) => setNewIntegration({ ...newIntegration, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {integrationTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <type.icon className="w-4 h-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="config">Configuração (JSON)</Label>
                  <Textarea
                    id="config"
                    value={JSON.stringify(newIntegration.config, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        setNewIntegration({ ...newIntegration, config });
                      } catch (error) {
                        // Ignore invalid JSON
                      }
                    }}
                    placeholder='{"url": "https://api.exemplo.com", "timeout": 30}'
                    rows={4}
                  />
                </div>
                
                <div>
                  <Label htmlFor="credentials">Credenciais (JSON)</Label>
                  <Textarea
                    id="credentials"
                    value={JSON.stringify(newIntegration.credentials, null, 2)}
                    onChange={(e) => {
                      try {
                        const credentials = JSON.parse(e.target.value);
                        setNewIntegration({ ...newIntegration, credentials });
                      } catch (error) {
                        // Ignore invalid JSON
                      }
                    }}
                    placeholder='{"api_key": "sua_chave_api", "secret": "seu_secret"}'
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={newIntegration.is_active}
                    onCheckedChange={(checked) => setNewIntegration({ ...newIntegration, is_active: checked })}
                  />
                  <Label htmlFor="active">Integração ativa</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createIntegration.isPending}>
                  Criar Integração
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
        </TabsList>
        
        <TabsContent value="integrations" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Carregando integrações...</div>
          ) : integrations?.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Globe className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Nenhuma integração configurada</h3>
                <p className="text-muted-foreground mb-4">
                  Conecte seu sistema com APIs externas, webhooks e outras ferramentas.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeira integração
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {integrations?.map((integration) => (
                <Card key={integration.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-accent rounded-lg">
                          {getIntegrationIcon(integration.type)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{integration.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {integration.type}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(integration.sync_status)}`}>
                              {integration.sync_status}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(integration.sync_status)}
                              <span>
                                {integration.last_sync
                                  ? `Última sincronização: ${formatDistanceToNow(new Date(integration.last_sync), {
                                      addSuffix: true,
                                      locale: ptBR,
                                    })}`
                                  : 'Nunca sincronizado'}
                              </span>
                            </div>
                            
                            <span>
                              Criado em {new Date(integration.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          
                          {integration.error_message && (
                            <div className="mt-2 p-2 bg-red-50 text-red-700 text-sm rounded">
                              <AlertCircle className="w-4 h-4 inline mr-1" />
                              {integration.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSyncIntegration(integration.id)}
                          disabled={syncIntegration.isPending}
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        
                        <Switch
                          checked={integration.is_active}
                          onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
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
        
        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Eventos de Webhook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {webhookEvents?.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{event.event_type}</Badge>
                        <Badge className={`text-xs ${getStatusColor(event.status)}`}>
                          {event.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {event.attempts} tentativas - {formatDistanceToNow(new Date(event.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.response_status && (
                        <Badge variant={event.response_status < 400 ? "default" : "destructive"}>
                          {event.response_status}
                        </Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="marketplace" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'WhatsApp Business', type: 'messaging', description: 'Integração com WhatsApp Business API' },
              { name: 'Slack', type: 'communication', description: 'Receba notificações no Slack' },
              { name: 'Gmail', type: 'email', description: 'Integração com Gmail API' },
              { name: 'Zapier', type: 'automation', description: 'Conecte com milhares de apps' },
              { name: 'Google Sheets', type: 'data', description: 'Exporte dados para planilhas' },
              { name: 'Mailchimp', type: 'marketing', description: 'Sincronize contatos com Mailchimp' },
            ].map((app) => (
              <Card key={app.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{app.name}</h3>
                      <Badge variant="outline" className="text-xs mt-1">
                        {app.type}
                      </Badge>
                    </div>
                    <Globe className="w-8 h-8 text-muted-foreground" />
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {app.description}
                  </p>
                  
                  <Button variant="outline" className="w-full">
                    Instalar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
