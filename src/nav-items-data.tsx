import { HomeIcon, Users, Settings, MessageSquare, Building2, Shield, Bell, BookOpen, Zap, Server, Target, HelpCircle, CreditCard, FileText, TrendingUp, Globe, Cog, Eye, Bot } from "lucide-react";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Team from "./pages/Team";
// import Projects from "./pages/Projects"; // Removido: tela de projetos descontinuada
// import Customers from "./pages/Customers"; // Removido: tela de clientes descontinuada
// import Analytics from "./pages/Analytics"; // Removido: tela de análise descontinuada
import CRM from "./pages/CRM";
import Communication from "./pages/Communication";
import SettingsPage from "./pages/Settings";
import Security from "./pages/Security";
import NotificationsCenter from "./pages/NotificationsCenter";
import Documentation from "./pages/Documentation";
import Automation from "./pages/Automation";
import Infrastructure from "./pages/Infrastructure";
import MultiSessions from "./pages/MultiSessions";
import Support from "./pages/Support";
import HR from "./pages/HR";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import BusinessIntelligence from "./pages/BusinessIntelligence";
import Integrations from "./pages/Integrations";
import Marketplace from "./pages/Marketplace";
import ApiManagement from "./pages/ApiManagement";
import Monitoring from "./pages/Monitoring";
import Features from "./pages/Features";
import BotsPage from "./pages/Bots";

export const navItems = [
  {
    title: "Início",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Dashboard",
    to: "/dashboard",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Dashboard />,
  },
  {
    title: "Equipe",
    to: "/team",
    icon: <Users className="h-4 w-4" />,
    page: <Team />,
  },
  {
    title: "CRM",
    to: "/crm",
    icon: <Target className="h-4 w-4" />,
    page: <CRM />,
  },
  {
    title: "Comunicação",
    to: "/communication",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Communication />,
  },
  {
    title: "Recursos Humanos",
    to: "/hr",
    icon: <Users className="h-4 w-4" />,
    page: <HR />,
  },
  {
    title: "Cobrança",
    to: "/billing",
    icon: <CreditCard className="h-4 w-4" />,
    page: <Billing />,
  },
  {
    title: "Relatórios",
    to: "/reports",
    icon: <FileText className="h-4 w-4" />,
    page: <Reports />,
  },
  {
    title: "Business Intelligence",
    to: "/business-intelligence",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <BusinessIntelligence />,
  },
  {
    title: "Integrações",
    to: "/integrations",
    icon: <Globe className="h-4 w-4" />,
    page: <Integrations />,
  },
  {
    title: "Marketplace",
    to: "/marketplace",
    icon: <Building2 className="h-4 w-4" />,
    page: <Marketplace />,
  },
  {
    title: "API Management",
    to: "/api-management",
    icon: <Cog className="h-4 w-4" />,
    page: <ApiManagement />,
  },
  {
    title: "Monitoramento",
    to: "/monitoring",
    icon: <Eye className="h-4 w-4" />,
    page: <Monitoring />,
  },
  {
    title: "Segurança",
    to: "/security",
    icon: <Shield className="h-4 w-4" />,
    page: <Security />,
  },
  {
    title: "Notificações",
    to: "/notifications",
    icon: <Bell className="h-4 w-4" />,
    page: <NotificationsCenter />,
  },
  {
    title: "Documentação",
    to: "/documentation",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Documentation />,
  },
  {
    title: "Automação",
    to: "/automation",
    icon: <Zap className="h-4 w-4" />,
    page: <Automation />,
  },
  {
    title: "Infraestrutura",
    to: "/infrastructure",
    icon: <Server className="h-4 w-4" />,
    page: <Infrastructure />,
  },
  {
    title: "Multi-Sessões",
    to: "/multi-sessions",
    icon: <Users className="h-4 w-4" />,
    page: <MultiSessions />,
  },
  {
    title: "Bots",
    to: "/bots",
    icon: <Bot className="h-4 w-4" />,
    page: <BotsPage />,
  },
  {
    title: "Suporte",
    to: "/support",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <Support />,
  },
  {
    title: "Funcionalidades",
    to: "/features",
    icon: <Zap className="h-4 w-4" />,
    page: <Features />,
  },
  {
    title: "Configurações",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <SettingsPage />,
  },
];
