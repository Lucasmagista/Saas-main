import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Settings,
  Bell,
  MessageSquare,
  Mail,
  Phone,
  Video,
  Smartphone,
  Monitor,
  Volume2,
  VolumeX,
  Wifi,
  Shield,
  Key,
  Database,
  Cloud,
  Palette,
  User,
  Users,
  Globe,
  Save,
  RotateCcw,
  Download,
  Upload,
  Lock,
  Unlock,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CommunicationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    // Notificações
    notifications: {
      desktop: true,
      mobile: true,
      email: true,
      sound: true,
      whatsapp: true,
      calls: true,
      calendar: true,
      leads: true,
      system: false
    },
    // WhatsApp
    whatsapp: {
      autoReply: true,
      autoReplyMessage: "Obrigado pelo contato! Em breve retornaremos.",
      businessHours: {
        enabled: true,
        start: "09:00",
        end: "18:00",
        timezone: "America/Sao_Paulo"
      },
      webhook: "",
      apiKey: "",
      phoneNumber: "+55 11 99999-9999",
      qrCodeExpiry: 24,
      maxSessions: 5
    },
    // Email
    email: {
      smtpHost: "smtp.gmail.com",
      smtpPort: 587,
      username: "",
      password: "",
      encryption: "tls",
      fromName: "CRM Pro",
      fromEmail: "noreply@crmpro.com",
      signature: "Atenciosamente,\nEquipe CRM Pro\ncrmpro.com",
      autoReply: false,
      autoReplySubject: "Recebemos seu email",
      autoReplyMessage: "Obrigado pelo seu email. Retornaremos em breve."
    },
    // Chamadas
    calls: {
      provider: "twilio",
      twilioSid: "",
      twilioToken: "",
      defaultCountryCode: "+55",
      recordCalls: true,
      transcribeAudio: false,
      voicemailEnabled: true,
      voicemailMessage: "Não foi possível atender. Deixe uma mensagem."
    },
    // Segurança
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30,
      ipWhitelist: "",
      encryptMessages: true,
      auditLogs: true,
      dataRetention: 365
    },
    // Interface
    interface: {
      theme: "system",
      language: "pt-BR",
      timezone: "America/Sao_Paulo",
      dateFormat: "dd/MM/yyyy",
      timeFormat: "24h",
      density: "comfortable",
      sidebarCollapsed: false
    },
    // Integrações
    integrations: {
      slack: {
        enabled: false,
        webhook: "",
        channel: "#comunicacao"
      },
      zapier: {
        enabled: false,
        webhook: ""
      },
      googleCalendar: {
        enabled: false,
        clientId: "",
        clientSecret: ""
      },
      zoom: {
        enabled: false,
        apiKey: "",
        apiSecret: ""
      }
    }
  });

  const [showPasswords, setShowPasswords] = useState({
    emailPassword: false,
    twilioToken: false,
    apiKeys: false
  });

  const updateSetting = (section: string, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateNestedSetting = (section: string, subsection: string, key: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [key]: value
        }
      }
    }));
  };

  const saveSettings = () => {
    // Simular salvamento
    toast({
      title: "Configurações salvas",
      description: "Todas as configurações foram atualizadas com sucesso.",
    });
  };

  const resetSettings = () => {
    toast({
      title: "Configurações redefinidas",
      description: "Todas as configurações foram restauradas aos valores padrão.",
    });
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'comunicacao-settings.json';
    link.click();
    
    toast({
      title: "Configurações exportadas",
      description: "Arquivo de configurações baixado com sucesso.",
    });
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string);
          setSettings(importedSettings);
          toast({
            title: "Configurações importadas",
            description: "Configurações foram importadas com sucesso.",
          });
        } catch (error) {
          toast({
            title: "Erro na importação",
            description: "Arquivo de configurações inválido.",
            variant: "destructive"
          });
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Configurações de Comunicação</h3>
          <p className="text-muted-foreground">
            Configure todos os aspectos da comunicação da sua equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={resetSettings}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
          <Button variant="outline" size="sm" onClick={exportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={importSettings}
              className="hidden"
            />
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </span>
            </Button>
          </label>
          <Button onClick={saveSettings}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="calls">Chamadas</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* Notificações */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Configurações de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-4">Canais de Notificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-blue-600" />
                      <span>Notificações Desktop</span>
                    </div>
                    <Switch
                      checked={settings.notifications.desktop}
                      onCheckedChange={(checked) =>
                        updateSetting('notifications', 'desktop', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <span>Notificações Mobile</span>
                    </div>
                    <Switch
                      checked={settings.notifications.mobile}
                      onCheckedChange={(checked) =>
                        updateSetting('notifications', 'mobile', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-600" />
                      <span>Notificações por Email</span>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) =>
                        updateSetting('notifications', 'email', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {settings.notifications.sound ? (
                        <Volume2 className="w-5 h-5 text-orange-600" />
                      ) : (
                        <VolumeX className="w-5 h-5 text-gray-600" />
                      )}
                      <span>Sons de Notificação</span>
                    </div>
                    <Switch
                      checked={settings.notifications.sound}
                      onCheckedChange={(checked) =>
                        updateSetting('notifications', 'sound', checked)
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-4">Tipos de Notificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries({
                    whatsapp: { label: "WhatsApp", icon: MessageSquare },
                    calls: { label: "Chamadas", icon: Phone },
                    calendar: { label: "Calendário", icon: Video },
                    leads: { label: "Novos Leads", icon: Users },
                    system: { label: "Sistema", icon: Settings }
                  }).map(([key, { label, icon: Icon }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                        <span>{label}</span>
                      </div>
                      <Switch
                        checked={settings.notifications[key]}
                        onCheckedChange={(checked) =>
                          updateSetting('notifications', key, checked)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  Configurações do WhatsApp
                </CardTitle>
                <CardDescription>
                  Configure a integração com WhatsApp Business API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Número do WhatsApp</Label>
                    <Input
                      value={settings.whatsapp.phoneNumber}
                      onChange={(e) => updateSetting('whatsapp', 'phoneNumber', e.target.value)}
                      placeholder="+55 11 99999-9999"
                    />
                  </div>
                  <div>
                    <Label>Máximo de Sessões</Label>
                    <Input
                      type="number"
                      value={settings.whatsapp.maxSessions}
                      onChange={(e) => updateSetting('whatsapp', 'maxSessions', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label>API Key do WhatsApp</Label>
                  <div className="relative">
                    <Input
                      type={showPasswords.apiKeys ? "text" : "password"}
                      value={settings.whatsapp.apiKey}
                      onChange={(e) => updateSetting('whatsapp', 'apiKey', e.target.value)}
                      placeholder="Digite a API Key"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPasswords(prev => ({ ...prev, apiKeys: !prev.apiKeys }))}
                    >
                      {showPasswords.apiKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Webhook URL</Label>
                  <Input
                    value={settings.whatsapp.webhook}
                    onChange={(e) => updateSetting('whatsapp', 'webhook', e.target.value)}
                    placeholder="https://sua-api.com/webhook"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Resposta Automática</h4>
                      <p className="text-sm text-muted-foreground">
                        Enviar mensagem automática para novos contatos
                      </p>
                    </div>
                    <Switch
                      checked={settings.whatsapp.autoReply}
                      onCheckedChange={(checked) =>
                        updateSetting('whatsapp', 'autoReply', checked)
                      }
                    />
                  </div>

                  {settings.whatsapp.autoReply && (
                    <div>
                      <Label>Mensagem de Resposta Automática</Label>
                      <Textarea
                        value={settings.whatsapp.autoReplyMessage}
                        onChange={(e) => updateSetting('whatsapp', 'autoReplyMessage', e.target.value)}
                        placeholder="Digite a mensagem automática"
                      />
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Horário Comercial</h4>
                      <p className="text-sm text-muted-foreground">
                        Definir horários de atendimento
                      </p>
                    </div>
                    <Switch
                      checked={settings.whatsapp.businessHours.enabled}
                      onCheckedChange={(checked) =>
                        updateNestedSetting('whatsapp', 'businessHours', 'enabled', checked)
                      }
                    />
                  </div>

                  {settings.whatsapp.businessHours.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label>Início</Label>
                        <Input
                          type="time"
                          value={settings.whatsapp.businessHours.start}
                          onChange={(e) => updateNestedSetting('whatsapp', 'businessHours', 'start', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Fim</Label>
                        <Input
                          type="time"
                          value={settings.whatsapp.businessHours.end}
                          onChange={(e) => updateNestedSetting('whatsapp', 'businessHours', 'end', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Fuso Horário</Label>
                        <Select
                          value={settings.whatsapp.businessHours.timezone}
                          onValueChange={(value) => updateNestedSetting('whatsapp', 'businessHours', 'timezone', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                            <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                            <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Configurações de Email
                </CardTitle>
                <CardDescription>
                  Configure servidor SMTP e configurações de email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Servidor SMTP</Label>
                    <Input
                      value={settings.email.smtpHost}
                      onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label>Porta SMTP</Label>
                    <Input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Usuário</Label>
                    <Input
                      value={settings.email.username}
                      onChange={(e) => updateSetting('email', 'username', e.target.value)}
                      placeholder="seu-email@gmail.com"
                    />
                  </div>
                  <div>
                    <Label>Senha</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.emailPassword ? "text" : "password"}
                        value={settings.email.password}
                        onChange={(e) => updateSetting('email', 'password', e.target.value)}
                        placeholder="Digite a senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, emailPassword: !prev.emailPassword }))}
                      >
                        {showPasswords.emailPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Remetente</Label>
                    <Input
                      value={settings.email.fromName}
                      onChange={(e) => updateSetting('email', 'fromName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Email do Remetente</Label>
                    <Input
                      value={settings.email.fromEmail}
                      onChange={(e) => updateSetting('email', 'fromEmail', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Criptografia</Label>
                  <Select
                    value={settings.email.encryption}
                    onValueChange={(value) => updateSetting('email', 'encryption', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assinatura de Email</Label>
                  <Textarea
                    value={settings.email.signature}
                    onChange={(e) => updateSetting('email', 'signature', e.target.value)}
                    placeholder="Sua assinatura de email"
                    className="min-h-[100px]"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Resposta Automática</h4>
                      <p className="text-sm text-muted-foreground">
                        Enviar confirmação automática de recebimento
                      </p>
                    </div>
                    <Switch
                      checked={settings.email.autoReply}
                      onCheckedChange={(checked) =>
                        updateSetting('email', 'autoReply', checked)
                      }
                    />
                  </div>

                  {settings.email.autoReply && (
                    <div className="space-y-4">
                      <div>
                        <Label>Assunto da Resposta Automática</Label>
                        <Input
                          value={settings.email.autoReplySubject}
                          onChange={(e) => updateSetting('email', 'autoReplySubject', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Mensagem da Resposta Automática</Label>
                        <Textarea
                          value={settings.email.autoReplyMessage}
                          onChange={(e) => updateSetting('email', 'autoReplyMessage', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Chamadas */}
        <TabsContent value="calls">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-orange-600" />
                  Configurações de Chamadas
                </CardTitle>
                <CardDescription>
                  Configure provedor de telefonia e recursos de chamada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Provedor de Telefonia</Label>
                  <Select
                    value={settings.calls.provider}
                    onValueChange={(value) => updateSetting('calls', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="vonage">Vonage</SelectItem>
                      <SelectItem value="plivo">Plivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Twilio Account SID</Label>
                    <Input
                      value={settings.calls.twilioSid}
                      onChange={(e) => updateSetting('calls', 'twilioSid', e.target.value)}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label>Twilio Auth Token</Label>
                    <div className="relative">
                      <Input
                        type={showPasswords.twilioToken ? "text" : "password"}
                        value={settings.calls.twilioToken}
                        onChange={(e) => updateSetting('calls', 'twilioToken', e.target.value)}
                        placeholder="Digite o auth token"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(prev => ({ ...prev, twilioToken: !prev.twilioToken }))}
                      >
                        {showPasswords.twilioToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Código do País Padrão</Label>
                  <Input
                    value={settings.calls.defaultCountryCode}
                    onChange={(e) => updateSetting('calls', 'defaultCountryCode', e.target.value)}
                    placeholder="+55"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Gravar Chamadas</h4>
                      <p className="text-sm text-muted-foreground">
                        Gravar automaticamente todas as chamadas
                      </p>
                    </div>
                    <Switch
                      checked={settings.calls.recordCalls}
                      onCheckedChange={(checked) =>
                        updateSetting('calls', 'recordCalls', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Transcrição de Áudio</h4>
                      <p className="text-sm text-muted-foreground">
                        Transcrever chamadas automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={settings.calls.transcribeAudio}
                      onCheckedChange={(checked) =>
                        updateSetting('calls', 'transcribeAudio', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Caixa Postal</h4>
                      <p className="text-sm text-muted-foreground">
                        Habilitar caixa postal para chamadas perdidas
                      </p>
                    </div>
                    <Switch
                      checked={settings.calls.voicemailEnabled}
                      onCheckedChange={(checked) =>
                        updateSetting('calls', 'voicemailEnabled', checked)
                      }
                    />
                  </div>

                  {settings.calls.voicemailEnabled && (
                    <div>
                      <Label>Mensagem da Caixa Postal</Label>
                      <Textarea
                        value={settings.calls.voicemailMessage}
                        onChange={(e) => updateSetting('calls', 'voicemailMessage', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Segurança */}
        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  Configurações de Segurança
                </CardTitle>
                <CardDescription>
                  Configure políticas de segurança e privacidade
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                      <p className="text-sm text-muted-foreground">
                        Adicionar camada extra de segurança
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.twoFactorAuth}
                      onCheckedChange={(checked) =>
                        updateSetting('security', 'twoFactorAuth', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notificações de Login</h4>
                      <p className="text-sm text-muted-foreground">
                        Notificar sobre novos logins
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.loginNotifications}
                      onCheckedChange={(checked) =>
                        updateSetting('security', 'loginNotifications', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Criptografar Mensagens</h4>
                      <p className="text-sm text-muted-foreground">
                        Criptografia end-to-end para mensagens
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.encryptMessages}
                      onCheckedChange={(checked) =>
                        updateSetting('security', 'encryptMessages', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Logs de Auditoria</h4>
                      <p className="text-sm text-muted-foreground">
                        Registrar todas as ações do sistema
                      </p>
                    </div>
                    <Switch
                      checked={settings.security.auditLogs}
                      onCheckedChange={(checked) =>
                        updateSetting('security', 'auditLogs', checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Timeout de Sessão (minutos)</Label>
                    <Input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Retenção de Dados (dias)</Label>
                    <Input
                      type="number"
                      value={settings.security.dataRetention}
                      onChange={(e) => updateSetting('security', 'dataRetention', parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Lista de IPs Permitidos</Label>
                  <Textarea
                    value={settings.security.ipWhitelist}
                    onChange={(e) => updateSetting('security', 'ipWhitelist', e.target.value)}
                    placeholder="192.168.1.1, 10.0.0.1 (um por linha ou separado por vírgula)"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrações */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600" />
                  Integrações Externas
                </CardTitle>
                <CardDescription>
                  Configure integrações com serviços externos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Slack */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Slack</h4>
                      <p className="text-sm text-muted-foreground">
                        Enviar notificações para canal do Slack
                      </p>
                    </div>
                    <Switch
                      checked={settings.integrations.slack.enabled}
                      onCheckedChange={(checked) =>
                        updateNestedSetting('integrations', 'slack', 'enabled', checked)
                      }
                    />
                  </div>

                  {settings.integrations.slack.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label>Webhook URL</Label>
                        <Input
                          value={settings.integrations.slack.webhook}
                          onChange={(e) => updateNestedSetting('integrations', 'slack', 'webhook', e.target.value)}
                          placeholder="https://hooks.slack.com/..."
                        />
                      </div>
                      <div>
                        <Label>Canal</Label>
                        <Input
                          value={settings.integrations.slack.channel}
                          onChange={(e) => updateNestedSetting('integrations', 'slack', 'channel', e.target.value)}
                          placeholder="#comunicacao"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Zapier */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Zapier</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatizar fluxos com Zapier
                      </p>
                    </div>
                    <Switch
                      checked={settings.integrations.zapier.enabled}
                      onCheckedChange={(checked) =>
                        updateNestedSetting('integrations', 'zapier', 'enabled', checked)
                      }
                    />
                  </div>

                  {settings.integrations.zapier.enabled && (
                    <div className="ml-6">
                      <Label>Webhook URL</Label>
                      <Input
                        value={settings.integrations.zapier.webhook}
                        onChange={(e) => updateNestedSetting('integrations', 'zapier', 'webhook', e.target.value)}
                        placeholder="https://hooks.zapier.com/..."
                      />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Google Calendar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Google Calendar</h4>
                      <p className="text-sm text-muted-foreground">
                        Sincronizar eventos e reuniões
                      </p>
                    </div>
                    <Switch
                      checked={settings.integrations.googleCalendar.enabled}
                      onCheckedChange={(checked) =>
                        updateNestedSetting('integrations', 'googleCalendar', 'enabled', checked)
                      }
                    />
                  </div>

                  {settings.integrations.googleCalendar.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label>Client ID</Label>
                        <Input
                          value={settings.integrations.googleCalendar.clientId}
                          onChange={(e) => updateNestedSetting('integrations', 'googleCalendar', 'clientId', e.target.value)}
                          placeholder="Google OAuth Client ID"
                        />
                      </div>
                      <div>
                        <Label>Client Secret</Label>
                        <Input
                          type="password"
                          value={settings.integrations.googleCalendar.clientSecret}
                          onChange={(e) => updateNestedSetting('integrations', 'googleCalendar', 'clientSecret', e.target.value)}
                          placeholder="Google OAuth Client Secret"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Zoom */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Zoom</h4>
                      <p className="text-sm text-muted-foreground">
                        Criar reuniões automáticas
                      </p>
                    </div>
                    <Switch
                      checked={settings.integrations.zoom.enabled}
                      onCheckedChange={(checked) =>
                        updateNestedSetting('integrations', 'zoom', 'enabled', checked)
                      }
                    />
                  </div>

                  {settings.integrations.zoom.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label>API Key</Label>
                        <Input
                          value={settings.integrations.zoom.apiKey}
                          onChange={(e) => updateNestedSetting('integrations', 'zoom', 'apiKey', e.target.value)}
                          placeholder="Zoom API Key"
                        />
                      </div>
                      <div>
                        <Label>API Secret</Label>
                        <Input
                          type="password"
                          value={settings.integrations.zoom.apiSecret}
                          onChange={(e) => updateNestedSetting('integrations', 'zoom', 'apiSecret', e.target.value)}
                          placeholder="Zoom API Secret"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}