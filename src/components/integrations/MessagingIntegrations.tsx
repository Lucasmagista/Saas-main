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
import { MessageSquare, Phone, Users, Settings, Plus, Trash2, Edit, QrCode, Key, Webhook, Activity, RefreshCw, Save, Download, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type BotConfig = {
  phone?: string;
  token?: string;
  webhook: string;
  qrCode?: string | null;
};

type Bot = {
  id: number;
  name: string;
  type: string;
  status: string;
} & BotConfig;

export function MessagingIntegrations() {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([
    { id: 1, name: "Bot Principal", type: "whatsapp", status: "active", phone: "+55 11 99999-9999", webhook: "https://webhook.site/unique-id", qrCode: null },
    { id: 2, name: "Bot Telegram", type: "telegram", status: "active", token: "123456789:ABCDEF", webhook: "https://api.telegram.org/bot123456789:ABCDEF/setWebhook", qrCode: null },
    { id: 3, name: "Bot Discord", type: "discord", status: "inactive", token: "", webhook: "", qrCode: null }
  ]);

  const [integrations, setIntegrations] = useState([
    { id: "whatsapp", name: "WhatsApp Business", icon: "💬", connected: true, webhook: "https://webhook.site/whatsapp" },
    { id: "telegram", name: "Telegram Bot", icon: "📱", connected: true, webhook: "https://api.telegram.org/webhook" },
    { id: "discord", name: "Discord Bot", icon: "🎮", connected: false, webhook: "" },
    { id: "slack", name: "Slack Integration", icon: "💼", connected: false, webhook: "" },
    { id: "instagram", name: "Instagram Direct", icon: "📸", connected: false, webhook: "" }
  ]);

  const [newBot, setNewBot] = useState({ name: "", type: "", phone: "", token: "", webhook: "" });
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [configuringIntegration, setConfiguringIntegration] = useState(null);
  const [showAddBot, setShowAddBot] = useState(false);
  const [showEditBot, setShowEditBot] = useState(false);
  const [showIntegrationConfig, setShowIntegrationConfig] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeBot, setQrCodeBot] = useState<Bot | null>(null);

  const generateQRCode = (bot: Bot) => {
    const qrCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    setBots(bots.map(b => b.id === bot.id ? { ...b, qrCode } : b));
    setQrCodeBot({ ...bot, qrCode });
    setShowQRCode(true);
    
    toast({
      title: "QR Code gerado",
      description: "Escaneie o QR Code com o WhatsApp para conectar o bot",
    });
  };

  const addBot = () => {
    if (!newBot.name || !newBot.type) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const botConfig: BotConfig = {
      webhook: newBot.webhook,
      qrCode: null
    };

    if (newBot.type === "whatsapp") {
      botConfig.phone = newBot.phone;
    } else {
      botConfig.token = newBot.token;
    }

    const bot: Bot = {
      id: Date.now(),
      name: newBot.name,
      type: newBot.type,
      status: "inactive",
      ...botConfig
    };

    setBots([...bots, bot]);
    setNewBot({ name: "", type: "", phone: "", token: "", webhook: "" });
    setShowAddBot(false);
    
    toast({
      title: "Bot criado",
      description: `${bot.name} foi criado com sucesso`
    });
  };

  const editBot = () => {
    if (!editingBot) return;

    setBots(bots.map(bot => 
      bot.id === editingBot.id ? editingBot : bot
    ));
    setEditingBot(null);
    setShowEditBot(false);
    
    toast({
      title: "Bot atualizado",
      description: "Configurações salvas com sucesso"
    });
  };

  const deleteBot = (id: number) => {
    setBots(bots.filter(bot => bot.id !== id));
    toast({
      title: "Bot removido",
      description: "Bot foi removido com sucesso"
    });
  };

  const toggleBot = (id: number) => {
    setBots(bots.map(bot => 
      bot.id === id 
        ? { ...bot, status: bot.status === "active" ? "inactive" : "active" }
        : bot
    ));
  };

  type Integration = {
    id: string;
    name: string;
    icon: string;
    connected: boolean;
    webhook: string;
  };

  const configureIntegration = (integration: Integration) => {
    setConfiguringIntegration(integration);
    setShowIntegrationConfig(true);
  };

  const saveIntegrationConfig = () => {
    if (!configuringIntegration) return;

    setIntegrations(integrations.map(integration =>
      integration.id === configuringIntegration.id
        ? { ...integration, ...configuringIntegration }
        : integration
    ));
    
    setConfiguringIntegration(null);
    setShowIntegrationConfig(false);
    
    toast({
      title: "Configuração salva",
      description: "Integração configurada com sucesso"
    });
  };

  const testWebhook = async (webhook: string) => {
    try {
      const response = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() })
      });

      toast({
        title: "Webhook testado",
        description: "Teste enviado com sucesso. Verifique os logs."
      });
    } catch (error) {
      toast({
        title: "Erro no webhook",
        description: "Falha ao enviar teste",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrações de Mensageria</CardTitle>
          <CardDescription>Gerencie bots e integrações de mensagens</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="bots">
            <TabsList>
              <TabsTrigger value="bots">Meus Bots</TabsTrigger>
              <TabsTrigger value="integrations">Integrações</TabsTrigger>
              <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="bots" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Bots Ativos</h3>
                <Dialog open={showAddBot} onOpenChange={setShowAddBot}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Bot
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Bot</DialogTitle>
                      <DialogDescription>Configure um novo bot de mensageria</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bot-name">Nome do Bot</Label>
                        <Input
                          id="bot-name"
                          value={newBot.name}
                          onChange={(e) => setNewBot({...newBot, name: e.target.value})}
                          placeholder="Ex: Bot Atendimento"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bot-type">Plataforma</Label>
                        <Select value={newBot.type} onValueChange={(value) => setNewBot({...newBot, type: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a plataforma" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="telegram">Telegram</SelectItem>
                            <SelectItem value="discord">Discord</SelectItem>
                            <SelectItem value="slack">Slack</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newBot.type === "whatsapp" && (
                        <div>
                          <Label htmlFor="bot-phone">Número do WhatsApp</Label>
                          <Input
                            id="bot-phone"
                            value={newBot.phone}
                            onChange={(e) => setNewBot({...newBot, phone: e.target.value})}
                            placeholder="+55 11 99999-9999"
                          />
                        </div>
                      )}
                      {(newBot.type === "telegram" || newBot.type === "discord") && (
                        <div>
                          <Label htmlFor="bot-token">Token do Bot</Label>
                          <Input
                            id="bot-token"
                            type="password"
                            value={newBot.token}
                            onChange={(e) => setNewBot({...newBot, token: e.target.value})}
                            placeholder="Cole o token aqui"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="bot-webhook">Webhook URL</Label>
                        <Input
                          id="bot-webhook"
                          value={newBot.webhook}
                          onChange={(e) => setNewBot({...newBot, webhook: e.target.value})}
                          placeholder="https://webhook.site/your-unique-id"
                        />
                      </div>
                      <Button onClick={addBot} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Bot
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="grid gap-4">
                {bots.map((bot) => (
                  <Card key={bot.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${bot.status === 'active' ? 'bg-green-500' : 'bg-gray-400'} text-white`}>
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold">{bot.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {bot.type.charAt(0).toUpperCase() + bot.type.slice(1)} • {bot.phone || (bot.token?.slice(0, 20) + "...")}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                            {bot.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Switch 
                            checked={bot.status === 'active'}
                            onCheckedChange={() => toggleBot(bot.id)}
                          />
                          {bot.type === "whatsapp" && (
                            <Button variant="outline" size="sm" onClick={() => generateQRCode(bot)}>
                              <QrCode className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="outline" size="sm" onClick={() => {
                            setEditingBot(bot);
                            setShowEditBot(true);
                          }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => testWebhook(bot.webhook)}>
                            <Activity className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Bot</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja remover este bot? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBot(bot.id)}>
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
            
            <TabsContent value="integrations" className="space-y-4">
              <div className="grid gap-4">
                {integrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.icon}</div>
                          <div>
                            <h4 className="font-semibold">{integration.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {integration.webhook || "Webhook não configurado"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={integration.connected ? 'default' : 'secondary'}>
                            {integration.connected ? 'Conectado' : 'Desconectado'}
                          </Badge>
                          <Button variant="outline" size="sm" onClick={() => configureIntegration(integration)}>
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="webhooks" className="space-y-4">
              <div className="grid gap-4">
                {bots.filter(bot => bot.webhook).map((bot) => (
                  <Card key={bot.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Webhook className="w-5 h-5" />
                          <div>
                            <h4 className="font-semibold">{bot.name}</h4>
                            <p className="text-sm text-muted-foreground font-mono">{bot.webhook}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => testWebhook(bot.webhook)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(bot.webhook)}>
                            <Copy className="w-4 h-4" />
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

      {/* Modal de Edição de Bot */}
      <Dialog open={showEditBot} onOpenChange={setShowEditBot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Bot</DialogTitle>
            <DialogDescription>Modifique as configurações do bot</DialogDescription>
          </DialogHeader>
          {editingBot && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-bot-name">Nome do Bot</Label>
                <Input
                  id="edit-bot-name"
                  value={editingBot.name}
                  onChange={(e) => setEditingBot({...editingBot, name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-bot-webhook">Webhook URL</Label>
                <Input
                  id="edit-bot-webhook"
                  value={editingBot.webhook}
                  onChange={(e) => setEditingBot({...editingBot, webhook: e.target.value})}
                />
              </div>
              <Button onClick={editBot} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Configuração de Integração */}
      <Dialog open={showIntegrationConfig} onOpenChange={setShowIntegrationConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Integração</DialogTitle>
            <DialogDescription>Configure as settings da integração</DialogDescription>
          </DialogHeader>
          {configuringIntegration && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="integration-webhook">Webhook URL</Label>
                <Input
                  id="integration-webhook"
                  value={configuringIntegration.webhook}
                  onChange={(e) => setConfiguringIntegration({...configuringIntegration, webhook: e.target.value})}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch 
                  checked={configuringIntegration.connected}
                  onCheckedChange={(checked) => setConfiguringIntegration({...configuringIntegration, connected: checked})}
                />
                <Label>Ativar integração</Label>
              </div>
              <Button onClick={saveIntegrationConfig} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de QR Code */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code do WhatsApp</DialogTitle>
            <DialogDescription>Escaneie este código com o WhatsApp</DialogDescription>
          </DialogHeader>
          {qrCodeBot && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center">
                <QrCode className="w-32 h-32 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Abra o WhatsApp no seu celular, vá em Configurações {' > '} Dispositivos conectados {' > '} 
                Conectar dispositivo e escaneie este código
              </p>
              <Button onClick={() => generateQRCode(qrCodeBot)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Gerar Novo QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
