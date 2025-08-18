import { useState, useEffect } from "react";
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
import { 
  MessageSquare, 
  Mail, 
  Video, 
  BarChart3, 
  Database, 
  Shield, 
  Zap, 
  Settings,
  // Activity,
  Webhook
} from "lucide-react";

const Integrations = () => {
  const [activeTab, setActiveTab] = useState("messaging");

  // Estatísticas
  const [stats, setStats] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Status do sistema
  const [systemStatus, setSystemStatus] = useState([]);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState(null);

  // Configurações globais
  const [globalConfig, setGlobalConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Buscar estatísticas
  useEffect(() => {
    setStatsLoading(true);
    fetch("/api/integrations/stats")
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setStatsLoading(false);
      })
      .catch(err => {
        setStatsError("Erro ao carregar estatísticas");
        setStatsLoading(false);
      });
  }, []);

  // Buscar status do sistema
  useEffect(() => {
    setStatusLoading(true);
    fetch("/api/integrations/status")
      .then(res => res.json())
      .then(data => {
        setSystemStatus(data);
        setStatusLoading(false);
      })
      .catch(err => {
        setStatusError("Erro ao carregar status do sistema");
        setStatusLoading(false);
      });
  }, []);

  // Buscar configurações globais
  useEffect(() => {
    setConfigLoading(true);
    fetch("/api/integrations/global-config")
      .then(res => res.json())
      .then(data => {
        setGlobalConfig(data);
        setConfigLoading(false);
      })
      .catch(err => {
        setConfigError("Erro ao carregar configurações globais");
        setConfigLoading(false);
      });
  }, []);

  // Salvar configurações globais
  const saveGlobalConfig = () => {
    setSavingConfig(true);
    fetch("/api/integrations/global-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(globalConfig)
    })
      .then(res => res.json())
      .then(() => setSavingConfig(false))
      .catch(() => setSavingConfig(false));
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
          {/* Adicione aqui botões e controles reais, conectados à sua API/backend */}
        </div>


        {/* Stats Cards - Dados reais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(() => {
            if (statsLoading) {
              return <div>Carregando estatísticas...</div>;
            }
            if (statsError) {
              return <div className="text-red-500">{statsError}</div>;
            }
            if (stats.length === 0) {
              return <div>Nenhuma estatística encontrada.</div>;
            }
            return stats.map((stat) => (
              <Card key={stat.id || stat.title} className="hover:shadow-lg transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    </div>
                    {stat.icon && (
                      <span className="w-8 h-8 flex items-center justify-center">
                        {/* Ícone pode ser um nome ou SVG vindo da API */}
                        <img src={stat.icon} alt="icon" className="w-8 h-8" />
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ));
          })()}
        </div>


        {/* Status System - Dados reais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Status do Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              if (statusLoading) {
                return <div>Carregando status...</div>;
              }
              if (statusError) {
                return <div className="text-red-500">{statusError}</div>;
              }
              if (systemStatus.length === 0) {
                return <div>Nenhum status encontrado.</div>;
              }
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {systemStatus.map((item) => {
                    let statusColor = "bg-red-500";
                    if (item.status === "ok") {
                      statusColor = "bg-green-500";
                    } else if (item.status === "degraded") {
                      statusColor = "bg-yellow-500";
                    }
                    return (
                      <div key={item.name || item.id} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`}></div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
        {/* Configurações Globais - Dados reais */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações Globais</CardTitle>
            <CardDescription>Configure comportamentos globais das integrações</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Refatoração do ternário aninhado para melhor legibilidade */}
            {configLoading && <div>Carregando configurações...</div>}
            {!configLoading && configError && (
              <div className="text-red-500">{configError}</div>
            )}
            {!configLoading && !configError && globalConfig && (
              <form onSubmit={e => { e.preventDefault(); saveGlobalConfig(); }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sincronização Automática</h4>
                    <p className="text-sm text-muted-foreground">Sync automático a cada 5 minutos</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!globalConfig.autoSync}
                    onChange={e => setGlobalConfig({ ...globalConfig, autoSync: e.target.checked })}
                    title="Sincronização Automática"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Webhooks Globais</h4>
                    <p className="text-sm text-muted-foreground">Ativar sistema de webhooks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!globalConfig.enableWebhooks}
                    onChange={e => setGlobalConfig({ ...globalConfig, enableWebhooks: e.target.checked })}
                    title="Webhooks Globais"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Logs Detalhados</h4>
                    <p className="text-sm text-muted-foreground">Registrar todas as ações</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!globalConfig.enableLogs}
                    onChange={e => setGlobalConfig({ ...globalConfig, enableLogs: e.target.checked })}
                    title="Logs Detalhados"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Métricas em Tempo Real</h4>
                    <p className="text-sm text-muted-foreground">Coleta de métricas contínua</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!globalConfig.enableMetrics}
                    onChange={e => setGlobalConfig({ ...globalConfig, enableMetrics: e.target.checked })}
                    title="Métricas em Tempo Real"
                  />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50" disabled={savingConfig}>
                  {savingConfig ? "Salvando..." : "Salvar Configurações"}
                </button>
              </form>
            )}
            {!configLoading && !configError && !globalConfig && (
              <div>Nenhuma configuração encontrada.</div>
            )}
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
