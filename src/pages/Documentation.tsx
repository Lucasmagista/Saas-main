
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  BookOpen, Search, Code, Shield, Database, Settings, 
  Users, BarChart3, Zap, Globe, HelpCircle, FileText,
  CheckCircle, AlertTriangle, Info, Star, ExternalLink,
  Download, Copy, Eye, GitBranch, Server, Monitor
} from "lucide-react";

const Documentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('overview');

  const sectionData = {
    overview: {
      title: "Visão Geral",
      icon: BookOpen,
      content: "Introdução ao CRM Pro Dashboard e suas funcionalidades principais."
    },
    architecture: {
      title: "Arquitetura",
      icon: Server,
      content: "Estrutura técnica, padrões de design e melhores práticas."
    },
    modules: {
      title: "Módulos",
      icon: Settings,
      content: "CRM, RH, Financeiro, Comunicação, E-commerce e mais."
    },
    integrations: {
      title: "Integrações",
      icon: Globe,
      content: "APIs externas, webhooks, Gmail, Shopify, Stripe e outras."
    },
    security: {
      title: "Segurança",
      icon: Shield,
      content: "LGPD, GDPR, autenticação, criptografia e compliance."
    },
    monitoring: {
      title: "Monitoramento",
      icon: Monitor,
      content: "Observabilidade, métricas, logs e alertas."
    }
  };

  const quickStats = [
    { label: "Módulos Integrados", value: "12+", icon: Settings, color: "bg-blue-500" },
    { label: "APIs Suportadas", value: "50+", icon: Globe, color: "bg-green-500" },
    { label: "Componentes UI", value: "100+", icon: Code, color: "bg-purple-500" },
    { label: "Uptime", value: "99.9%", icon: CheckCircle, color: "bg-emerald-500" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BookOpen className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">CRM Pro Dashboard</h1>
              <p className="text-xl text-gray-600 mt-2">Documentação Completa</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="w-3 h-3 mr-1" />
              Best Practices
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Star className="w-3 h-3 mr-1" />
              Enterprise Quality
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Monitor className="w-3 h-3 mr-1" />
              Full Observability
            </Badge>
            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
              <Shield className="w-3 h-3 mr-1" />
              LGPD Compliant
            </Badge>
          </div>

          {/* Search */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Buscar na documentação..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Documentation */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            {Object.entries(sectionData).map(([key, section]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                <section.icon className="w-4 h-4" />
                <span className="hidden md:inline">{section.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Visão Geral da Plataforma
                </CardTitle>
                <CardDescription>
                  O CRM Pro Dashboard é uma solução SaaS completa para gestão empresarial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed">
                    Uma plataforma integrada que combina CRM, RH, Financeiro, Comunicação, E-commerce, 
                    Analytics e muito mais em uma única solução robusta e escalável.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Users className="w-8 h-8 text-blue-500 mb-2" />
                    <h3 className="font-semibold mb-1">CRM Avançado</h3>
                    <p className="text-sm text-gray-600">Gestão completa de clientes, vendas e relacionamento.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <BarChart3 className="w-8 h-8 text-green-500 mb-2" />
                    <h3 className="font-semibold mb-1">Analytics</h3>
                    <p className="text-sm text-gray-600">Dashboards inteligentes e relatórios em tempo real.</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Zap className="w-8 h-8 text-purple-500 mb-2" />
                    <h3 className="font-semibold mb-1">Automação</h3>
                    <p className="text-sm text-gray-600">Workflows automatizados e integrações nativas.</p>
                  </div>
                </div>

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="architecture">
                    <AccordionTrigger>Arquitetura da Plataforma</AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
{`Frontend: Next.js 15 + TypeScript + Tailwind CSS
Backend: Node.js + PostgreSQL + Redis
Integrações: REST APIs + WebSockets + Webhooks
Monitoramento: Prometheus + Grafana + Loki
Deploy: Docker + Kubernetes + CI/CD`}
                        </pre>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="modules">
                    <AccordionTrigger>Módulos Principais</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Core Business</h4>
                          <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Dashboard & Analytics</li>
                            <li>• CRM & Vendas</li>
                            <li>• RH & Gestão de Pessoas</li>
                            <li>• Financeiro & Billing</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Operacional</h4>
                          <ul className="text-sm space-y-1 text-gray-600">
                            <li>• Comunicação & Chat</li>
                            <li>• E-commerce & Marketplace</li>
                            <li>• Automação & Workflows</li>
                            <li>• Integrações & APIs</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Arquitetura & Padrões
                </CardTitle>
                <CardDescription>
                  Estrutura técnica, componentes e melhores práticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estrutura de Projeto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
{`src/
├── components/     # Componentes reutilizáveis
│   ├── ui/         # Base shadcn/ui
│   ├── dashboard/  # Específicos do dashboard
│   ├── hr/         # Módulo RH
│   └── forms/      # Formulários
├── lib/            # Utils, configs, APIs
├── hooks/          # Custom hooks
├── pages/          # Páginas da aplicação
├── styles/         # Estilos globais
└── types/          # Definições TypeScript`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Convenções de Código</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">Nomenclatura</h4>
                          <div className="bg-gray-50 p-3 rounded text-xs">
                            <code>// PascalCase para componentes<br/>
                            export function UserProfile() {}</code>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Arquivos</h4>
                          <div className="bg-gray-50 p-3 rounded text-xs">
                            <code>// kebab-case para arquivos<br/>
                            user-profile.tsx</code>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Design System</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium mb-1">Clareza</h4>
                        <p className="text-xs text-gray-600">Interface limpa e hierarquia visual clara</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-green-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-medium mb-1">Consistência</h4>
                        <p className="text-xs text-gray-600">Componentes e padrões uniformes</p>
                      </div>
                      <div className="text-center p-4 border rounded-lg">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-3 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-medium mb-1">Eficiência</h4>
                        <p className="text-xs text-gray-600">Fluxos otimizados e carregamento rápido</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { name: "Dashboard", icon: BarChart3, desc: "KPIs, métricas e visão geral", color: "bg-blue-500" },
                { name: "CRM", icon: Users, desc: "Gestão de clientes e vendas", color: "bg-green-500" },
                { name: "RH", icon: Users, desc: "Recrutamento e gestão de pessoas", color: "bg-purple-500" },
                { name: "Financeiro", icon: BarChart3, desc: "Faturamento e billing", color: "bg-orange-500" },
                { name: "Comunicação", icon: Globe, desc: "Email, chat e notificações", color: "bg-cyan-500" },
                { name: "E-commerce", icon: Settings, desc: "Produtos, pedidos e marketplace", color: "bg-pink-500" }
              ].map((module, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`${module.color} p-2 rounded-lg`}>
                        <module.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-lg">{module.name}</CardTitle>
                    </div>
                    <CardDescription>{module.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Documentação
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Integrações Disponíveis
                </CardTitle>
                <CardDescription>
                  APIs externas, webhooks e conectores nativos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { name: "Gmail/Outlook", category: "Email", status: "active" },
                    { name: "Shopify", category: "E-commerce", status: "active" },
                    { name: "Stripe", category: "Pagamentos", status: "active" },
                    { name: "HubSpot", category: "Marketing", status: "beta" },
                    { name: "Zoom", category: "Reuniões", status: "active" },
                    { name: "WhatsApp", category: "Mensagens", status: "active" },
                    { name: "Meta Ads", category: "Publicidade", status: "beta" },
                    { name: "Google Analytics", category: "Analytics", status: "active" }
                  ].map((integration, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{integration.name}</h4>
                        <Badge 
                          variant={integration.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {integration.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{integration.category}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Segurança & Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mb-2" />
                      <h4 className="font-medium text-sm">LGPD Compliant</h4>
                      <p className="text-xs text-gray-600">Conformidade total</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Shield className="w-5 h-5 text-blue-600 mb-2" />
                      <h4 className="font-medium text-sm">Criptografia AES-256</h4>
                      <p className="text-xs text-gray-600">Dados protegidos</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Users className="w-5 h-5 text-purple-600 mb-2" />
                      <h4 className="font-medium text-sm">MFA Obrigatório</h4>
                      <p className="text-xs text-gray-600">Autenticação dupla</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <FileText className="w-5 h-5 text-orange-600 mb-2" />
                      <h4 className="font-medium text-sm">Logs de Auditoria</h4>
                      <p className="text-xs text-gray-600">Rastreamento completo</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Checklist de Segurança</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      "MFA obrigatório para admins",
                      "SSO integrado (Google, Microsoft)",
                      "Criptografia AES-256 em repouso",
                      "TLS 1.3 em trânsito",
                      "Backup automático",
                      "Disaster recovery testado",
                      "Conformidade LGPD/GDPR",
                      "Políticas de retenção"
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    Stack de Monitoramento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Prometheus</h4>
                        <p className="text-sm text-gray-600">Coleta de métricas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Grafana</h4>
                        <p className="text-sm text-gray-600">Dashboards e alertas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Loki</h4>
                        <p className="text-sm text-gray-600">Logs centralizados</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métricas-Chave</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Uptime</span>
                      <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Latência API</span>
                      <Badge className="bg-blue-100 text-blue-800">&lt; 100ms</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Taxa de Erro</span>
                      <Badge className="bg-green-100 text-green-800">&lt; 0.1%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Throughput</span>
                      <Badge className="bg-purple-100 text-purple-800">1k req/s</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <GitBranch className="w-5 h-5" />
                <span>API Reference</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                <span>GitHub</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                <span>Suporte</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Documentation;
