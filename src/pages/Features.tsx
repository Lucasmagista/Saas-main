
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { 
  Smartphone, 
  Wifi, 
  WifiOff, 
  Cpu, 
  Activity, 
  Globe, 
  Zap, 
  Bot,
  Workflow,
  Brain,
  Shield,
  Gauge,
  TrendingUp,
  Download,
  Bell,
  Calendar,
  Mail,
  MessageCircle,
  FileText,
  ChevronRight,
  PlayCircle,
  CheckCircle
} from "lucide-react";

const Features = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pwaInstallable, setPwaInstallable] = useState(false);
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    activeUsers: 1247,
    conversionsToday: 89,
    responseTime: 0.8,
    systemLoad: 23
  });

  // Simular dados em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeMetrics(prev => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10 - 5),
        conversionsToday: prev.conversionsToday + Math.floor(Math.random() * 3),
        responseTime: Math.max(0.1, prev.responseTime + (Math.random() - 0.5) * 0.2),
        systemLoad: Math.max(0, Math.min(100, prev.systemLoad + (Math.random() - 0.5) * 10))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const performanceData = [
    { time: "00:00", response: 0.6, load: 15 },
    { time: "04:00", response: 0.5, load: 12 },
    { time: "08:00", response: 0.9, load: 35 },
    { time: "12:00", response: 1.2, load: 45 },
    { time: "16:00", response: 0.8, load: 38 },
    { time: "20:00", response: 0.7, load: 25 },
  ];

  const workflowExamples = [
    {
      name: "Onboarding de Cliente",
      description: "Automatiza o processo completo de novos clientes",
      triggers: ["Novo cadastro", "Pagamento confirmado"],
      actions: ["Email de boas-vindas", "Criação de conta", "Atribuição de manager"],
      status: "active"
    },
    {
      name: "Follow-up de Vendas",
      description: "Sequência automática para leads qualificados",
      triggers: ["Lead qualificado", "Demonstração agendada"],
      actions: ["WhatsApp", "Email personalizado", "Tarefa para SDR"],
      status: "active"
    },
    {
      name: "Recuperação de Carrinho",
      description: "Reativa clientes com carrinho abandonado",
      triggers: ["Carrinho abandonado > 2h"],
      actions: ["Email desconto", "SMS lembrete", "Push notification"],
      status: "paused"
    }
  ];

  const aiFeatures = [
    {
      name: "Análise de Sentimento",
      description: "Análise automática de feedback e reviews",
      accuracy: 94,
      icon: <Brain className="w-5 h-5" />
    },
    {
      name: "Previsão de Churn",
      description: "Identifica clientes em risco de cancelamento",
      accuracy: 87,
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      name: "Recomendações",
      description: "Sugere produtos e ações baseado em ML",
      accuracy: 91,
      icon: <Bot className="w-5 h-5" />
    },
    {
      name: "Chatbot Inteligente",
      description: "Atendimento 24/7 com GPT-4",
      accuracy: 96,
      icon: <MessageCircle className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">Funcionalidades Avançadas</h1>
          <p className="text-xl text-gray-600">Explore as capacidades técnicas da nossa plataforma SaaS</p>
        </div>

        {/* PWA & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                Progressive Web App (PWA)
              </CardTitle>
              <CardDescription>Experiência nativa em qualquer dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {isOnline ? <Wifi className="w-4 h-4 text-green-600" /> : <WifiOff className="w-4 h-4 text-red-600" />}
                  <span className="text-sm font-medium">Status de Conexão</span>
                </div>
                <Badge variant={isOnline ? "default" : "destructive"}>
                  {isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Recursos PWA:</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Funcionamento offline
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Push notifications
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Instalação nativa
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Sincronização automática
                  </li>
                </ul>
              </div>

              <Button className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Instalar App
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Métricas em Tempo Real
              </CardTitle>
              <CardDescription>Monitoramento live da plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{realTimeMetrics.activeUsers.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Usuários Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{realTimeMetrics.conversionsToday}</div>
                  <div className="text-sm text-gray-600">Conversões Hoje</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tempo de Resposta</span>
                  <span className="font-medium">{realTimeMetrics.responseTime.toFixed(1)}s</span>
                </div>
                <Progress value={Math.min(100, realTimeMetrics.responseTime * 50)} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU Load</span>
                  <span className="font-medium">{realTimeMetrics.systemLoad.toFixed(0)}%</span>
                </div>
                <Progress value={realTimeMetrics.systemLoad} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Charts */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-orange-600" />
              Performance Analytics
            </CardTitle>
            <CardDescription>Métricas de performance das últimas 24 horas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="response" stackId="1" stroke="#3b82f6" fill="#3b82f680" name="Tempo Resposta (s)" />
                <Area type="monotone" dataKey="load" stackId="2" stroke="#10b981" fill="#10b98180" name="CPU Load (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Workflows & Automation */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="w-5 h-5 text-indigo-600" />
              Automação & Workflows
            </CardTitle>
            <CardDescription>Workflows inteligentes no-code para automação completa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {workflowExamples.map((workflow, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{workflow.name}</h4>
                    <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                      {workflow.status === "active" ? "Ativo" : "Pausado"}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600">{workflow.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">TRIGGERS:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workflow.triggers.map((trigger, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{trigger}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-xs font-medium text-gray-500">AÇÕES:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {workflow.actions.map((action, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{action}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="w-full">
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Configurar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* IA & Machine Learning */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
              Inteligência Artificial & ML
            </CardTitle>
            <CardDescription>Recursos avançados de IA para automação inteligente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className="font-medium">{feature.name}</h4>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Precisão</span>
                      <span className="font-medium">{feature.accuracy}%</span>
                    </div>
                    <Progress value={feature.accuracy} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Technical Architecture */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              Arquitetura Técnica
            </CardTitle>
            <CardDescription>Stack tecnológico e infraestrutura moderna</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="frontend" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="frontend">Frontend</TabsTrigger>
                <TabsTrigger value="backend">Backend</TabsTrigger>
                <TabsTrigger value="database">Database</TabsTrigger>
                <TabsTrigger value="devops">DevOps</TabsTrigger>
              </TabsList>

              <TabsContent value="frontend" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "React 18", desc: "Framework principal" },
                    { name: "TypeScript", desc: "Type safety" },
                    { name: "Tailwind CSS", desc: "Styling system" },
                    { name: "Shadcn/ui", desc: "Components" }
                  ].map((tech, i) => (
                    <div key={i} className="p-3 border rounded-lg text-center">
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-gray-600">{tech.desc}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="backend" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Node.js", desc: "Runtime" },
                    { name: "Express", desc: "Web framework" },
                    { name: "Prisma", desc: "ORM" },
                    { name: "Redis", desc: "Cache & Sessions" }
                  ].map((tech, i) => (
                    <div key={i} className="p-3 border rounded-lg text-center">
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-gray-600">{tech.desc}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="database" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "PostgreSQL", desc: "Primary DB" },
                    { name: "Redis", desc: "Cache layer" },
                    { name: "S3", desc: "File storage" },
                    { name: "ElasticSearch", desc: "Search engine" }
                  ].map((tech, i) => (
                    <div key={i} className="p-3 border rounded-lg text-center">
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-gray-600">{tech.desc}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="devops" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: "Docker", desc: "Containerization" },
                    { name: "Kubernetes", desc: "Orchestration" },
                    { name: "GitHub Actions", desc: "CI/CD" },
                    { name: "Grafana", desc: "Monitoring" }
                  ].map((tech, i) => (
                    <div key={i} className="p-3 border rounded-lg text-center">
                      <div className="font-medium">{tech.name}</div>
                      <div className="text-xs text-gray-600">{tech.desc}</div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security & Compliance */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Segurança & Compliance
            </CardTitle>
            <CardDescription>Segurança empresarial e conformidade LGPD/GDPR</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Autenticação</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    MFA/2FA obrigatório
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    SSO com SAML/OAuth
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Biometria (WebAuthn)
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Criptografia</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    AES-256 end-to-end
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    TLS 1.3 transport
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    PKI infraestrutura
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Compliance</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    LGPD compliance
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    GDPR ready
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    SOC 2 Type II
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Features;
