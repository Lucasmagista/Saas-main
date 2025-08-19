import React, { useState } from 'react';
import { useWebhookManagement } from '../hooks/useWebhooks';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Plus, Settings, TestTube, Trash2, Eye, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CreateWebhookForm {
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
  secret?: string;
}

const AVAILABLE_EVENTS = [
  'message.received',
  'message.sent',
  'bot.started',
  'bot.stopped',
  'webhook.test',
  'user.created',
  'user.updated'
];

export const WebhookManager: React.FC = () => {
  const {
    webhooks,
    isLoading,
    isError,
    createWebhook,
    updateWebhook,
    deleteWebhook,
    testWebhook,
    regenerateSecret,
    isCreating,
    isUpdating,
    isDeleting,
    isTesting,
    isRegenerating
  } = useWebhookManagement();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  const [formData, setFormData] = useState<CreateWebhookForm>({
    name: '',
    url: '',
    events: [],
    is_active: true
  });

  const handleCreateWebhook = () => {
    if (!formData.name || !formData.url || formData.events.length === 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    createWebhook(formData);
    setIsCreateDialogOpen(false);
    setFormData({ name: '', url: '', events: [], is_active: true });
  };

  const handleTestWebhook = (webhookId: string, event: string) => {
    testWebhook({ id: webhookId, event, payload: { test: true, timestamp: new Date().toISOString() } });
    setIsTestDialogOpen(false);
  };

  const handleRegenerateSecret = (webhookId: string) => {
    regenerateSecret(webhookId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando webhooks...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert>
        <AlertDescription>
          Erro ao carregar webhooks. Tente novamente.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Webhooks</h1>
          <p className="text-muted-foreground">
            Gerencie os webhooks para receber notificações em tempo real
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Webhook</DialogTitle>
              <DialogDescription>
                Configure um novo webhook para receber notificações
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Meu Webhook"
                />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://api.exemplo.com/webhook"
                />
              </div>
              <div>
                <Label>Eventos</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {AVAILABLE_EVENTS.map((event) => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={formData.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, events: [...formData.events, event] });
                          } else {
                            setFormData({ ...formData, events: formData.events.filter(e => e !== event) });
                          }
                        }}
                      />
                      <Label htmlFor={event} className="text-sm">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="active">Ativo</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateWebhook} disabled={isCreating}>
                {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Webhook
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhooks List */}
      <div className="grid gap-4">
        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32">
              <Settings className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Nenhum webhook configurado</p>
              <p className="text-sm text-muted-foreground">Crie seu primeiro webhook para começar</p>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {webhook.name}
                      <Badge variant={webhook.is_active ? "default" : "secondary"}>
                        {webhook.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {webhook.url}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <TestTube className="h-4 w-4 mr-2" />
                          Testar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Testar Webhook</DialogTitle>
                          <DialogDescription>
                            Envie um evento de teste para este webhook
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Evento</Label>
                            <Select onValueChange={(value) => setSelectedWebhook({ ...webhook, testEvent: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um evento" />
                              </SelectTrigger>
                              <SelectContent>
                                {webhook.events.map((event) => (
                                  <SelectItem key={event} value={event}>
                                    {event}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={() => handleTestWebhook(webhook.id, selectedWebhook?.testEvent || 'webhook.test')}
                            disabled={isTesting}
                          >
                            {isTesting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Enviar Teste
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerateSecret(webhook.id)}
                      disabled={isRegenerating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerar Secret
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(webhook.url)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar URL
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteWebhook(webhook.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Eventos Configurados</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Criado em: {new Date(webhook.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};