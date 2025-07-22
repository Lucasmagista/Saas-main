import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessagingIntegrations } from "@/components/integrations/MessagingIntegrations";
import { EmailIntegrations } from "@/components/integrations/EmailIntegrations";
import { VideoCallIntegrations } from "@/components/integrations/VideoCallIntegrations";
import { AnalyticsIntegrations } from "@/components/integrations/AnalyticsIntegrations";
import { CRMIntegrations } from "@/components/integrations/CRMIntegrations";
import { SecurityIntegrations } from "@/components/integrations/SecurityIntegrations";
import { AdvancedIntegrations } from "@/components/integrations/AdvancedIntegrations";
import { IntegrationsSettings } from "@/components/settings/IntegrationsSettings";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Mail, 
  Video, 
  BarChart3, 
  Database, 
  Shield, 
  Zap, 
  Settings,
  RefreshCw,
  Globe,
  CheckCircle,
  Users,
  TrendingUp,
  Activity,
  Server,
  Webhook
} from "lucide-react";

const Integrations = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("messaging");
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats dinâmicas
  const [stats, setStats] = useState([
    {
      title: "Integrações Ativas",
      value: "24",
      change: "+3 este mês",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Usuários Conectados",
      value: "12,543",
      change: "+1,234 este mês",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "API Calls",
      value: "1.2M",
      change: "+15% este mês",
      icon: Globe,
      color: "text-purple-600"
    },
    {
      title: "Uptime",
      value: "99.9%",
      change: "Últimos 30 dias",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ]);

  const syncAll = async () => {
    setIsRefreshing(true);
    
    toast({
      title: "Sincronização iniciada",
      description: "Atualizando todas as integrações..."
    });

    // Simula sincronização
    setTimeout(() => {
      // Atualiza estatísticas
      setStats(prevStats => prevStats.map(stat => ({
        ...stat,
        value: stat.title === "Integrações Ativas" ? "27" :
               stat.title === "Usuários Conectados" ? "13,789" :
               stat.title === "API Calls" ? "1.35M" :
               stat.title === "Uptime" ? "99.95%" : stat.value
      })));

      setIsRefreshing(false);
      
      toast({
        title: "Sincronização concluída",
        description: "Todas as integrações foram atualizadas com sucesso"
      });
    }, 3000);
  };

  const openGlobalSettings = () => {
    setShowGlobalSettings(true);
  };

  const [globalConfig, setGlobalConfig] = useState({
    autoSync: true,
    enableWebhooks: true,
    maxRetries: 3,
    timeout: 30000,
    enableLogs: true,
    enableMetrics: true
  });

  const saveGlobalConfig = () => {
    setShowGlobalSettings(false);
    
    toast({
      title: "Configurações salvas",
      description: "Configurações globais atualizadas com sucesso"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Integrações Avançadas</h1>
            <p className="text-gray-600 mt-1">
              Conecte, automatize e integre com todas as suas ferramentas favoritas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={syncAll}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Sincronizando...' : 'Sincronizar Tudo'}
            </Button>
            <Dialog open={showGlobalSettings} onOpenChange={setShowGlobalSettings}>
              <DialogTrigger asChild>
                <Button onClick={openGlobalSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurações Globais</DialogTitle>
                  <DialogDescription>Configure comportamentos globais das integrações</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Sincronização Automática</h4>
                      <p className="text-sm text-muted-foreground">Sync automático a cada 5 minutos</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={globalConfig.autoSync}
                      onChange={(e) => setGlobalConfig({...globalConfig, autoSync: e.target.checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Webhooks Globais</h4>
                      <p className="text-sm text-muted-foreground">Ativar sistema de webhooks</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={globalConfig.enableWebhooks}
                      onChange={(e) => setGlobalConfig({...globalConfig, enableWebhooks: e.target.checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Logs Detalhados</h4>
                      <p className="text-sm text-muted-foreground">Registrar todas as ações</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={globalConfig.enableLogs}
                      onChange={(e) => setGlobalConfig({...globalConfig, enableLogs: e.target.checked})}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Métricas em Tempo Real</h4>
                      <p className="text-sm text-muted-foreground">Coleta de métricas contínua</p>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={globalConfig.enableMetrics}
                      onChange={(e) => setGlobalConfig({...globalConfig, enableMetrics: e.target.checked})}
                    />
                  </div>
                  
                  <Button onClick={saveGlobalConfig} className="w-full">
                    Salvar Configurações
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Status System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">API Principal</p>
                  <p className="text-sm text-muted-foreground">Operacional</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Webhooks</p>
                  <p className="text-sm text-muted-foreground">Operacional</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium">Sincronização</p>
                  <p className="text-sm text-muted-foreground">Degradado</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Integration Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Gerenciar Integrações</CardTitle>
            <CardDescription>
              Configure e monitore todas as suas integrações em um só lugar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="messaging" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Mensagens</span>
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Email</span>
                </TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">Vídeo</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="crm" className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span className="hidden sm:inline">CRM</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span className="hidden sm:inline">Segurança</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span className="hidden sm:inline">Avançado</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Config</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="messaging">
                <MessagingIntegrations />
              </TabsContent>

              <TabsContent value="email">
                <EmailIntegrations />
              </TabsContent>

              <TabsContent value="video">
                <VideoCallIntegrations />
              </TabsContent>

              <TabsContent value="analytics">
                <AnalyticsIntegrations />
              </TabsContent>

              <TabsContent value="crm">
                <CRMIntegrations />
              </TabsContent>

              <TabsContent value="security">
                <SecurityIntegrations />
              </TabsContent>

              <TabsContent value="advanced">
                <AdvancedIntegrations />
              </TabsContent>

              <TabsContent value="settings">
                <IntegrationsSettings />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => setActiveTab("advanced")}>
                <Webhook className="w-4 h-4 mr-2" />
                Configurar Webhook
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar API Keys
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("analytics")}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Ver Relatórios
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("security")}>
                <Shield className="w-4 h-4 mr-2" />
                Configurar Segurança
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Integrations;
