import React, { Suspense } from 'react';
import { HomeIcon, Users, Settings, MessageSquare, Building2, Shield, Bell, BookOpen, Zap, Server, Target, HelpCircle, CreditCard, FileText, TrendingUp, Globe, Cog, Eye, Key, Bot } from "lucide-react";
import Index from "./pages/Index";
import { useTranslation } from 'react-i18next';
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Team = React.lazy(() => import('@/pages/Team'));
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
const BotManagement = React.lazy(() => import('@/components/automation/BotManagement'));
const RefreshTokenDemo = React.lazy(() => import('@/pages/RefreshTokenDemo'));
const ADMINProfile = React.lazy(() => import('@/pages/ADMINProfile'));

// Definição da estrutura de um item de navegação. A propriedade `roles` indica
// quais cargos (profile.position) podem acessar o item. Quando `roles` é
// undefined, qualquer usuário autenticado pode acessar o item.
export interface NavItem {
  title: string;
  to: string;
  icon: JSX.Element;
  page: JSX.Element;
  roles?: string[];
}

// ...existing code...

export function useNavItems(): NavItem[] {
  const { t } = useTranslation();
  return [
    {
      title: 'Administrador',
      to: '/admin-profile',
      icon: <Shield className="h-4 w-4" />,
      page: <Suspense fallback={<div>Carregando...</div>}><ADMINProfile /></Suspense>,
      roles: ['admin','ceo'],
    },
    {
      title: t('home'),
      to: "/",
      icon: <HomeIcon className="h-4 w-4" />,
      page: <Index />,
      // Home/dashboard pode ser acessado por qualquer usuário
      roles: undefined as string[] | undefined,
    },
    {
      title: t('dashboard'),
      to: "/dashboard",
      icon: <HomeIcon className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Dashboard /></Suspense>,
      // Dashboard disponível para todos
      roles: undefined,
    },
    {
      title: t('team'),
      to: "/team",
      icon: <Users className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Team /></Suspense>,
      // Apenas gestores, administradores e RH têm acesso ao módulo de equipe
      roles: ['manager','admin','hr','ceo'],
    },
    {
      title: t('crm'),
      to: "/crm",
      icon: <Target className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><CRM /></Suspense>,
      // CRM acessível ao time comercial e administradores
      roles: ['comercial','crm','admin','manager'],
    },
    {
      title: t('communication'),
      to: "/communication",
      icon: <MessageSquare className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Communication /></Suspense>,
      // Módulo de comunicação para atendimento, suporte e administração
      roles: ['assistencia','comercial','support','admin','manager','ceo'],
    },
    {
      title: t('hr'),
      to: "/hr",
      icon: <Users className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><HR /></Suspense>,
      // Recursos Humanos visível apenas para RH, executivos e administradores
      roles: ['hr','admin','ceo'],
    },
    {
      title: t('billing'),
      to: "/billing",
      icon: <CreditCard className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Billing /></Suspense>,
      // Cobrança e faturas disponíveis ao departamento financeiro, executivos e admins
      roles: ['financeiro','admin','ceo'],
    },
    {
      title: t('reports'),
      to: "/reports",
      icon: <FileText className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Reports /></Suspense>,
      // Relatórios gerais acessíveis a executivos, administradores e gestores
      roles: ['ceo','admin','manager'],
    },
    {
      title: t('businessIntelligence'),
      to: "/business-intelligence",
      icon: <TrendingUp className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><BusinessIntelligence /></Suspense>,
      // BI é reservado para executivos, administradores e gestores
      roles: ['ceo','admin','manager'],
    },
    {
      title: t('integrations'),
      to: "/integrations",
      icon: <Globe className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Integrations /></Suspense>,
      // Integrações sensíveis, disponíveis para administradores e executivos
      roles: ['admin','ceo','it','manager'],
    },
    {
      title: t('marketplace'),
      to: "/marketplace",
      icon: <Building2 className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Marketplace /></Suspense>,
      // Marketplace de apps acessível para todos os usuários cadastrados
      roles: undefined,
    },
    {
      title: t('apiManagement'),
      to: "/api-management",
      icon: <Cog className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><ApiManagement /></Suspense>,
      // Gerenciamento de API apenas para administradores e equipe técnica
      roles: ['admin','it','developer','ceo'],
    },
    {
      title: t('monitoring'),
      to: "/monitoring",
      icon: <Eye className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Monitoring /></Suspense>,
      // Monitoramento de infraestrutura reservado para equipe técnica e administradores
      roles: ['admin','it','manager','ceo'],
    },
    {
      title: t('security'),
      to: "/security",
      icon: <Shield className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Security /></Suspense>,
      // Configurações de segurança apenas para administradores e equipe de segurança
      roles: ['admin','it','security','ceo'],
    },
    {
      title: t('notifications'),
      to: "/notifications",
      icon: <Bell className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><NotificationsCenter /></Suspense>,
      // Central de notificações acessível a todos
      roles: undefined,
    },
    {
      title: t('documentation'),
      to: "/documentation",
      icon: <BookOpen className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Documentation /></Suspense>,
      // Documentação é pública para todos os usuários logados
      roles: undefined,
    },
    {
      title: t('automation'),
      to: "/automation",
      icon: <Zap className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Automation /></Suspense>,
      // Automação reservada para administradores e gestores
      roles: ['admin','manager','it','ceo'],
    },
    {
      title: t('infrastructure'),
      to: "/infrastructure",
      icon: <Server className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Infrastructure /></Suspense>,
      // Infraestrutura apenas para equipe técnica e administradores
      roles: ['admin','it','ceo'],
    },
    {
      title: t('multiSessions'),
      to: "/multi-sessions",
      icon: <Users className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><MultiSessions /></Suspense>,
      // Sessões múltiplas disponíveis para equipe de suporte e administradores
      roles: ['assistencia','support','admin','manager','ceo'],
    },
    {
      title: "Bots",
      to: "/bots",
      icon: <Bot className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><BotManagement /></Suspense>,
      // Gerenciamento de bots disponível para administradores e equipe de suporte
      roles: ['admin','manager','ceo','assistencia','support'],
    },
    {
      title: t('support'),
      to: "/support",
      icon: <HelpCircle className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Support /></Suspense>,
      // Suporte acessível para suporte, equipe de atendimento e administradores
      roles: ['assistencia','support','admin','manager','comercial'],
    },
    {
      title: t('features'),
      to: "/features",
      icon: <Zap className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Features /></Suspense>,
      // Apenas desenvolvedores ou administradores podem acessar recursos experimentais
      roles: ['admin','developer','it'],
    },
    {
      title: 'Refresh Tokens Demo',
      to: "/refresh-tokens-demo",
      icon: <Key className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><RefreshTokenDemo /></Suspense>,
      // Demo do sistema de refresh tokens - visível para todos para demonstração
      roles: undefined,
    },
    {
      title: t('settings'),
      to: "/settings",
      icon: <Settings className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><SettingsPage /></Suspense>,
      // Configurações são visíveis somente para administradores, executivos e gestores
      roles: ['admin','ceo','manager'],
    },
  ];
}
    