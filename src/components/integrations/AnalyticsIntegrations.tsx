import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { BarChart3, TrendingUp, Users, Activity, Settings, Download, Filter, Plus, FileText, Eye, MousePointer, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

export function AnalyticsIntegrations() {
  const { toast } = useToast();
  const [analyticsFeatures, setAnalyticsFeatures] = useState([
    { id: "realtime", name: "Métricas em Tempo Real", description: "Dashboard ao vivo", enabled: true },
    { id: "heatmaps", name: "Heatmaps", description: "Análise de cliques e interações", enabled: true },
    { id: "conversion", name: "Funil de Conversão", description: "Análise de conversões", enabled: false },
    { id: "ab_testing", name: "Testes A/B", description: "Experimentos automatizados", enabled: true },
    { id: "performance", name: "Performance Analytics", description: "Velocidade e otimização", enabled: false },
    { id: "user_behavior", name: "Comportamento do Usuário", description: "Jornada completa do cliente", enabled: true }
  ]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });

  const [reports, setReports] = useState([
    { id: 1, name: "Relatório de Conversões", type: "conversion", status: "ready", lastGenerated: new Date().toISOString() },
    { id: 2, name: "Análise de Performance", type: "performance", status: "generating", lastGenerated: new Date().toISOString() },
    { id: 3, name: "Comportamento do Usuário", type: "behavior", status: "ready", lastGenerated: new Date().toISOString() }
  ]);

  const [showFilters, setShowFilters] = useState(false);
  const [showCustomReport, setShowCustomReport] = useState(false);

  const toggleFeature = (id: string) => {
    setAnalyticsFeatures(analyticsFeatures.map(feature => 
      feature.id === id 
        ? { ...feature, enabled: !feature.enabled }
        : feature
    ));

    const feature = analyticsFeatures.find(f => f.id === id);
    toast({
      title: feature?.enabled ? "Recurso desativado" : "Recurso ativado",
      description: `${feature?.name} foi ${feature?.enabled ? 'desativado' : 'ativado'} com sucesso`
    });
  };

  const generateReport = (type: string) => {
    const newReport = {
      id: Date.now(),
      name: `Relatório ${type} - ${new Date().toLocaleDateString()}`,
      type,
      status: "generating" as const,
      lastGenerated: new Date().toISOString()
    };

    setReports([newReport, ...reports]);
    
    toast({
      title: "Gerando relatório",
      description: "Seu relatório está sendo processado..."
    });

    // Simula geração do relatório
    setTimeout(() => {
      setReports(prev => prev.map(report => 
        report.id === newReport.id 
          ? { ...report, status: "ready" as const }
          : report
      ));
      
      toast({
        title: "Relatório gerado",
        description: "Seu relatório está pronto para download"
      });
    }, 3000);
  };

  const downloadReport = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    // Simula download
    const blob = new Blob([`Relatório: ${report.name}\nGerado em: ${new Date().toLocaleString()}`], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado",
      description: "O arquivo está sendo baixado"
    });
  };

  const exportData = () => {
    toast({
      title: "Exportando dados",
      description: "Preparando arquivo de exportação..."
    });

    setTimeout(() => {
      const csvData = "Data,Metric,Value\n2024-01-01,Conversions,45\n2024-01-02,Conversions,52";
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analytics-export.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Dados exportados",
        description: "Arquivo CSV baixado com sucesso"
      });
    }, 1500);
  };

  const applyFilters = () => {
    toast({
      title: "Filtros aplicados",
      description: "Dashboard atualizado com os novos filtros"
    });
    setShowFilters(false);
  };

  const createCustomReport = () => {
    toast({
      title: "Relatório personalizado criado",
      description: "Seu relatório foi adicionado à lista"
    });
    setShowCustomReport(false);
  };

  const featureIcons = {
    realtime: <Activity className="w-6 h-6" />,
    heatmaps: <MousePointer className="w-6 h-6" />,
    conversion: <TrendingUp className="w-6 h-6" />,
    ab_testing: <BarChart3 className="w-6 h-6" />,
    performance: <Clock className="w-6 h-6" />,
    user_behavior: <Users className="w-6 h-6" />
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analytics e Relatórios</CardTitle>
              <CardDescription>Configure análises avançadas e geração de relatórios</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={showFilters} onOpenChange={setShowFilters}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Configurar Filtros</DialogTitle>
                    <DialogDescription>Defina filtros para os relatórios</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Período</label>
                      <DatePickerWithRange 
                        date={dateRange} 
                        onDateChange={setDateRange} 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Fonte de Dados</label>
                      <Select defaultValue="all">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as fontes</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="app">Aplicativo</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={applyFilters} className="w-full">
                      Aplicar Filtros
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button variant="outline" onClick={exportData}>
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={showCustomReport} onOpenChange={setShowCustomReport}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Relatório Personalizado
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Relatório Personalizado</DialogTitle>
                    <DialogDescription>Configure um novo relatório</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Nome do Relatório</label>
                      <input className="w-full p-2 border rounded" placeholder="Nome do relatório" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Métricas</label>
                      <Select defaultValue="conversions">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conversions">Conversões</SelectItem>
                          <SelectItem value="traffic">Tráfego</SelectItem>
                          <SelectItem value="engagement">Engajamento</SelectItem>
                          <SelectItem value="revenue">Receita</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={createCustomReport} className="w-full">
                      Criar Relatório
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="features">
            <TabsList>
              <TabsTrigger value="features">Recursos</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="features" className="space-y-4">
              <div className="grid gap-4">
                {analyticsFeatures.map((feature) => (
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
            
            <TabsContent value="reports" className="space-y-4">
              <div className="grid gap-4">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5" />
                          <div>
                            <h4 className="font-semibold">{report.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Gerado em: {new Date(report.lastGenerated).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                            {report.status === 'ready' ? 'Pronto' : 'Gerando...'}
                          </Badge>
                          {report.status === 'ready' && (
                            <Button variant="outline" size="sm" onClick={() => downloadReport(report.id)}>
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button onClick={() => generateReport('conversion')}>
                  Gerar Relatório de Conversão
                </Button>
                <Button onClick={() => generateReport('performance')} variant="outline">
                  Gerar Relatório de Performance
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Visitantes Únicos</p>
                        <p className="text-2xl font-bold">12,543</p>
                        <p className="text-xs text-green-600">+12% este mês</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                        <p className="text-2xl font-bold">3.24%</p>
                        <p className="text-xs text-green-600">+0.3% este mês</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Médio</p>
                        <p className="text-2xl font-bold">4:32</p>
                        <p className="text-xs text-blue-600">Por sessão</p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Páginas/Sessão</p>
                        <p className="text-2xl font-bold">2.8</p>
                        <p className="text-xs text-green-600">+0.2 este mês</p>
                      </div>
                      <Eye className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="insights" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-2">Insights Automáticos</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium">🚀 Oportunidade detectada</p>
                        <p className="text-sm text-muted-foreground">
                          A página de checkout tem 23% mais conversões nos fins de semana
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium">⚠️ Atenção necessária</p>
                        <p className="text-sm text-muted-foreground">
                          Taxa de abandono de carrinho aumentou 15% na última semana
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium">✅ Melhoria confirmada</p>
                        <p className="text-sm text-muted-foreground">
                          Nova versão da landing page aumentou conversões em 8%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
