import React, { useState, useEffect } from "react";
import i18n from '@/lib/i18n';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { SecuritySettings } from "@/components/settings/SecuritySettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { CustomizationSettings } from "@/components/settings/CustomizationSettings";
import { BillingSettings } from "@/components/billing/BillingSettings";
import { SettingsHistoryComponent } from "@/components/settings/SettingsHistory";
import { ConfirmDialog } from "@/components/settings/ConfirmDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Building, 
  CreditCard, 
  BarChart, 
  Upload,
  Loader2,
  Settings as SettingsIcon,
  Calendar,
  Languages,
  HardDrive
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { useToast } from "@/hooks/use-toast";
import { useSettingsContext } from "@/contexts/SettingsContext";

const Settings = () => {
  const { toast } = useToast();
  const { companySettings, generalSettings, updateCompanySettings } = useSettingsContext();
  const {
    history,
    loading,
    saveCompanySettings,
    saveGeneralSettings,
    uploadLogo
  } = useSettings();

  const [localCompanySettings, setLocalCompanySettings] = useState(companySettings);
  const [localGeneralSettings, setLocalGeneralSettings] = useState(generalSettings);

  // Sincronizar com o contexto quando as configurações mudarem
  useEffect(() => {
    setLocalCompanySettings(companySettings);
  }, [companySettings]);

  useEffect(() => {
    setLocalGeneralSettings(generalSettings);
  }, [generalSettings]);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    destructive?: boolean;
  }>({
    open: false,
    title: '',
    description: '',
    action: () => {},
    destructive: false
  });

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast({
          title: "Arquivo muito grande",
          description: "O logo deve ter no máximo 5MB.",
          variant: "destructive"
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Formato inválido",
          description: "O arquivo deve ser uma imagem.",
          variant: "destructive"
        });
        return;
      }

      try {
        await uploadLogo(file);
        // Força atualização do estado local para refletir a mudança imediatamente
        const updatedSettings = { ...localCompanySettings };
        setLocalCompanySettings(updatedSettings);
      } catch (error) {
        console.error('Erro no upload:', error);
      }
    }
  };

  const handleSaveCompany = () => {
    setConfirmDialog({
      open: true,
      title: "Salvar Informações da Empresa",
      description: "Tem certeza que deseja salvar as alterações nas informações da empresa?",
      action: () => {
        saveCompanySettings(localCompanySettings);
        updateCompanySettings(localCompanySettings); // Atualiza contexto global imediatamente
      }
    });
  };

  const handleSaveGeneral = () => {
    setConfirmDialog({
      open: true,
      title: "Salvar Configurações Gerais",
      description: "Tem certeza que deseja salvar as alterações nas configurações gerais?",
      action: () => {
        saveGeneralSettings(localGeneralSettings);
        i18n.changeLanguage(localGeneralSettings.language);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie todas as configurações da sua conta e empresa</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-8 h-12">
            <TabsTrigger value="profile" className="text-sm">Perfil</TabsTrigger>
            <TabsTrigger value="company" className="text-sm">Empresa</TabsTrigger>
            <TabsTrigger value="general" className="text-sm">Geral</TabsTrigger>
            <TabsTrigger value="customization" className="text-sm">Personalização</TabsTrigger>
            <TabsTrigger value="security" className="text-sm">Segurança</TabsTrigger>
            <TabsTrigger value="notifications" className="text-sm">Notificações</TabsTrigger>
            <TabsTrigger value="billing" className="text-sm">Cobrança</TabsTrigger>
            <TabsTrigger value="integrations" className="text-sm">Integrações</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informações da Empresa
                </CardTitle>
                <CardDescription>Configure os dados da sua organização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Label>Logo da Empresa</Label>
                  <div className="flex items-center gap-4">
                    {localCompanySettings.logo ? (
                      <img 
                        src={localCompanySettings.logo} 
                        alt="Logo da empresa" 
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Building className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          disabled={loading}
                        />
                        <Button variant="outline" disabled={loading} asChild>
                          <span>
                            {loading ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload Logo
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG até 5MB
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nome da Empresa</Label>
                    <Input 
                      id="company-name" 
                      value={localCompanySettings.name}
                      onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input 
                      id="cnpj" 
                      value={localCompanySettings.cnpj}
                      onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, cnpj: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Setor</Label>
                    <Input 
                      id="industry" 
                      value={localCompanySettings.industry}
                      onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">Funcionários</Label>
                    <Select 
                      value={localCompanySettings.size}
                      onValueChange={(value) => setLocalCompanySettings(prev => ({ ...prev, size: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10</SelectItem>
                        <SelectItem value="11-50">11-50</SelectItem>
                        <SelectItem value="51-200">51-200</SelectItem>
                        <SelectItem value="201-500">201-500</SelectItem>
                        <SelectItem value="500+">500+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="founded">Fundada em</Label>
                    <Input 
                      id="founded" 
                      type="number"
                      value={localCompanySettings.founded}
                      onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, founded: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select 
                      value={localCompanySettings.timezone}
                      onValueChange={(value) => setLocalCompanySettings(prev => ({ ...prev, timezone: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova York (UTC-5)</SelectItem>
                        <SelectItem value="Europe/London">Londres (UTC+0)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tóquio (UTC+9)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input 
                    id="address" 
                    value={localCompanySettings.address}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição da Empresa</Label>
                  <Textarea
                    id="description"
                    className="min-h-[100px] resize-none"
                    value={localCompanySettings.description}
                    onChange={(e) => setLocalCompanySettings(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <Button onClick={handleSaveCompany} disabled={loading} className="w-full md:w-auto">
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Salvar Informações
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Informações do Plano
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50">
                      <div className="mb-4">
                        <Badge className="bg-blue-600 text-white mb-2">Plano Ativo</Badge>
                        <h3 className="font-semibold text-lg">Configure seu plano</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          Entre em contato com o suporte para configurar seu plano de assinatura
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">Contatar Suporte</Button>
                      <Button className="flex-1">Ver Planos</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart className="w-5 h-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 border rounded-lg">
                      <h4 className="font-medium mb-2">Status da Conta</h4>
                      <p className="text-sm text-gray-600">
                        Conta ativa e funcionando normalmente
                      </p>
                      <div className="mt-4">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Ativo
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>


          </TabsContent>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" />
                  Configurações Gerais
                </CardTitle>
                <CardDescription>Configure preferências globais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Languages className="w-5 h-5 text-blue-600" />
                      <h4 className="font-medium">Idioma e Localização</h4>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Idioma</Label>
                      <Select 
                        value={localGeneralSettings.language}
                        onValueChange={(value) => {
                          setLocalGeneralSettings(prev => ({ ...prev, language: value }));
                          i18n.changeLanguage(value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es-ES">Español</SelectItem>
                          <SelectItem value="fr-FR">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Moeda</Label>
                      <Select 
                        value={localGeneralSettings.currency}
                        onValueChange={(value) => setLocalGeneralSettings(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BRL">Real (R$)</SelectItem>
                          <SelectItem value="USD">Dólar ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">Libra (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <h4 className="font-medium">Data e Hora</h4>
                    </div>

                    <div className="space-y-2">
                      <Label>Formato de Data</Label>
                      <Select 
                        value={localGeneralSettings.dateFormat}
                        onValueChange={(value) => setLocalGeneralSettings(prev => ({ ...prev, dateFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                          <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                          <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Formato de Hora</Label>
                      <Select 
                        value={localGeneralSettings.timeFormat}
                        onValueChange={(value) => setLocalGeneralSettings(prev => ({ ...prev, timeFormat: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 horas</SelectItem>
                          <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <HardDrive className="w-5 h-5 text-purple-600" />
                    <h4 className="font-medium">Backup Automático</h4>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Ativar Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Criar backups automáticos dos dados importantes
                      </p>
                    </div>
                    <Switch
                      checked={localGeneralSettings.autoBackup}
                      onCheckedChange={(checked) => 
                        setLocalGeneralSettings(prev => ({ ...prev, autoBackup: checked }))
                      }
                    />
                  </div>

                  {localGeneralSettings.autoBackup && (
                    <div className="space-y-2 ml-6">
                      <Label>Frequência do Backup</Label>
                      <Select 
                        value={localGeneralSettings.backupFrequency}
                        onValueChange={(value) => setLocalGeneralSettings(prev => ({ ...prev, backupFrequency: value }))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">A cada hora</SelectItem>
                          <SelectItem value="daily">Diariamente</SelectItem>
                          <SelectItem value="weekly">Semanalmente</SelectItem>
                          <SelectItem value="monthly">Mensalmente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <Button onClick={handleSaveGeneral} disabled={loading} className="w-full md:w-auto">
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            <SettingsHistoryComponent history={history} />
          </TabsContent>

          <TabsContent value="customization">
            <CustomizationSettings />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="billing">
            <BillingSettings />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsSettings />
          </TabsContent>
        </Tabs>

        <ConfirmDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
          title={confirmDialog.title}
          description={confirmDialog.description}
          onConfirm={() => {
            confirmDialog.action();
            setConfirmDialog(prev => ({ ...prev, open: false }));
          }}
          destructive={confirmDialog.destructive}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default Settings;
