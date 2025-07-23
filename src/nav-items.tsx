
import { HomeIcon, Users, BarChart3, Settings, MessageSquare, Building2, Shield, Bell, BookOpen, Zap, Server, Target, HelpCircle, Briefcase, UserCheck, CreditCard, FileText, TrendingUp, Globe, Cog, Eye } from "lucide-react";
import Index from "./pages/Index";
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
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

// ...existing code...

export function useNavItems() {
  const { t } = useTranslation();
  return [
    {
      title: t('home'),
      to: "/",
      icon: <HomeIcon className="h-4 w-4" />,
      page: <Index />,
    },
    {
      title: t('dashboard'),
      to: "/dashboard",
      icon: <HomeIcon className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Dashboard /></Suspense>,
    },
    {
      title: t('team'),
      to: "/team",
      icon: <Users className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Team /></Suspense>,
    },
    {
      title: t('projects'),
      to: "/projects",
      icon: <Briefcase className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Projects /></Suspense>,
    },
    {
      title: t('customers'),
      to: "/customers",
      icon: <UserCheck className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Customers /></Suspense>,
    },
    {
      title: t('analytics'),
      to: "/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Analytics /></Suspense>,
    },
    {
      title: t('crm'),
      to: "/crm",
      icon: <Target className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><CRM /></Suspense>,
    },
    {
      title: t('communication'),
      to: "/communication",
      icon: <MessageSquare className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Communication /></Suspense>,
    },
    {
      title: t('hr'),
      to: "/hr",
      icon: <Users className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><HR /></Suspense>,
    },
    {
      title: t('billing'),
      to: "/billing",
      icon: <CreditCard className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Billing /></Suspense>,
    },
    {
      title: t('reports'),
      to: "/reports",
      icon: <FileText className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Reports /></Suspense>,
    },
    {
      title: t('businessIntelligence'),
      to: "/business-intelligence",
      icon: <TrendingUp className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><BusinessIntelligence /></Suspense>,
    },
    {
      title: t('integrations'),
      to: "/integrations",
      icon: <Globe className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Integrations /></Suspense>,
    },
    {
      title: t('marketplace'),
      to: "/marketplace",
      icon: <Building2 className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Marketplace /></Suspense>,
    },
    {
      title: t('apiManagement'),
      to: "/api-management",
      icon: <Cog className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><ApiManagement /></Suspense>,
    },
    {
      title: t('monitoring'),
      to: "/monitoring",
      icon: <Eye className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Monitoring /></Suspense>,
    },
    {
      title: t('security'),
      to: "/security",
      icon: <Shield className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Security /></Suspense>,
    },
    {
      title: t('notifications'),
      to: "/notifications",
      icon: <Bell className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><NotificationsCenter /></Suspense>,
    },
    {
      title: t('documentation'),
      to: "/documentation",
      icon: <BookOpen className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Documentation /></Suspense>,
    },
    {
      title: t('automation'),
      to: "/automation",
      icon: <Zap className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Automation /></Suspense>,
    },
    {
      title: t('infrastructure'),
      to: "/infrastructure",
      icon: <Server className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Infrastructure /></Suspense>,
    },
    {
      title: t('multiSessions'),
      to: "/multi-sessions",
      icon: <Users className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><MultiSessions /></Suspense>,
    },
    {
      title: t('support'),
      to: "/support",
      icon: <HelpCircle className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Support /></Suspense>,
    },
    {
      title: t('features'),
      to: "/features",
      icon: <Zap className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><Features /></Suspense>,
    },
    {
      title: t('settings'),
      to: "/settings",
      icon: <Settings className="h-4 w-4" />,
      page: <Suspense fallback={<div>{t('loading')}</div>}><SettingsPage /></Suspense>,
    },
  ];
}
    