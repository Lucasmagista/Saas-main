
import { HomeIcon, Users, BarChart3, Settings, MessageSquare, Building2, Shield, Bell, BookOpen, Zap, Server, Target, HelpCircle, Briefcase, UserCheck, CreditCard, FileText, TrendingUp, Globe, Cog, Eye } from "lucide-react";
import Index from "./pages/Index";
import React, { Suspense } from 'react';
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Team = React.lazy(() => import('@/pages/Team'));
const Projects = React.lazy(() => import('@/pages/Projects'));
const Customers = React.lazy(() => import('@/pages/Customers'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));
const CRM = React.lazy(() => import('@/pages/CRM'));
const Communication = React.lazy(() => import('@/pages/Communication'));
const SettingsPage = React.lazy(() => import('@/pages/Settings'));
const Security = React.lazy(() => import('@/pages/Security'));
const NotificationsCenter = React.lazy(() => import('@/pages/NotificationsCenter'));
const Documentation = React.lazy(() => import('@/pages/Documentation'));
const Automation = React.lazy(() => import('@/pages/Automation'));
const Infrastructure = React.lazy(() => import('@/pages/Infrastructure'));
const MultiSessions = React.lazy(() => import('@/pages/MultiSessions'));
const Support = React.lazy(() => import('@/pages/Support'));
const HR = React.lazy(() => import('@/pages/HR'));
const Billing = React.lazy(() => import('@/pages/Billing'));
const Reports = React.lazy(() => import('@/pages/Reports'));
const BusinessIntelligence = React.lazy(() => import('@/pages/BusinessIntelligence'));
const Integrations = React.lazy(() => import('@/pages/Integrations'));
const Marketplace = React.lazy(() => import('@/pages/Marketplace'));
const ApiManagement = React.lazy(() => import('@/pages/ApiManagement'));
const Monitoring = React.lazy(() => import('@/pages/Monitoring'));
const Features = React.lazy(() => import('@/pages/Features'));

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
    page: <Suspense fallback={<div>Carregando...</div>}><Dashboard /></Suspense>,
  },
  {
    title: "Equipe",
    to: "/team",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Team /></Suspense>,
  },
  {
    title: "Projetos",
    to: "/projects",
    icon: <Briefcase className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Projects /></Suspense>,
  },
  {
    title: "Clientes",
    to: "/customers",
    icon: <UserCheck className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Customers /></Suspense>,
  },
  {
    title: "Analytics",
    to: "/analytics",
    icon: <BarChart3 className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Analytics /></Suspense>,
  },
  {
    title: "CRM",
    to: "/crm",
    icon: <Target className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><CRM /></Suspense>,
  },
  {
    title: "Comunicação",
    to: "/communication",
    icon: <MessageSquare className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Communication /></Suspense>,
  },
  {
    title: "Recursos Humanos",
    to: "/hr",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><HR /></Suspense>,
  },
  {
    title: "Cobrança",
    to: "/billing",
    icon: <CreditCard className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Billing /></Suspense>,
  },
  {
    title: "Relatórios",
    to: "/reports",
    icon: <FileText className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Reports /></Suspense>,
  },
  {
    title: "Business Intelligence",
    to: "/business-intelligence",
    icon: <TrendingUp className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><BusinessIntelligence /></Suspense>,
  },
  {
    title: "Integrações",
    to: "/integrations",
    icon: <Globe className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Integrations /></Suspense>,
  },
  {
    title: "Marketplace",
    to: "/marketplace",
    icon: <Building2 className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Marketplace /></Suspense>,
  },
  {
    title: "API Management",
    to: "/api-management",
    icon: <Cog className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><ApiManagement /></Suspense>,
  },
  {
    title: "Monitoramento",
    to: "/monitoring",
    icon: <Eye className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Monitoring /></Suspense>,
  },
  {
    title: "Segurança",
    to: "/security",
    icon: <Shield className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Security /></Suspense>,
  },
  {
    title: "Notificações",
    to: "/notifications",
    icon: <Bell className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><NotificationsCenter /></Suspense>,
  },
  {
    title: "Documentação",
    to: "/documentation",
    icon: <BookOpen className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Documentation /></Suspense>,
  },
  {
    title: "Automação",
    to: "/automation",
    icon: <Zap className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Automation /></Suspense>,
  },
  {
    title: "Infraestrutura",
    to: "/infrastructure",
    icon: <Server className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Infrastructure /></Suspense>,
  },
  {
    title: "Multi-Sessões",
    to: "/multi-sessions",
    icon: <Users className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><MultiSessions /></Suspense>,
  },
  {
    title: "Suporte",
    to: "/support",
    icon: <HelpCircle className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Support /></Suspense>,
  },
  {
    title: "Funcionalidades",
    to: "/features",
    icon: <Zap className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><Features /></Suspense>,
  },
  {
    title: "Configurações",
    to: "/settings",
    icon: <Settings className="h-4 w-4" />,
    page: <Suspense fallback={<div>Carregando...</div>}><SettingsPage /></Suspense>,
  },
];

// Componente de navegação principal com abrir/fechar tela
import { useState } from "react";

export function MainNavigation() {
  const [selectedNav, setSelectedNav] = useState(null);

  const handleNavClick = (item) => {
    if (selectedNav && selectedNav.to === item.to) {
      setSelectedNav(null); // Fecha a tela se clicar novamente
    } else {
      setSelectedNav(item);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex gap-2 p-4 border-b bg-white">
        {navItems.map(item => (
          <button
            key={item.to}
            className={`flex items-center gap-2 px-4 py-2 rounded transition-all font-medium ${selectedNav && selectedNav.to === item.to ? "bg-blue-100 text-blue-700" : "hover:bg-slate-100 text-slate-700"}`}
            onClick={() => handleNavClick(item)}
          >
            {item.icon}
            <span>{item.title}</span>
          </button>
        ))}
      </nav>
      <div className="flex-1">
        {selectedNav ? selectedNav.page : <Index />}
      </div>
    </div>
  );
}
