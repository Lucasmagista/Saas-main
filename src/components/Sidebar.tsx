import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, FolderKanban, BarChart3, Users, Settings, UserCircle, MessageSquare, Zap, FileText, Mail, Link as LinkIcon, ChevronLeft, ChevronRight, Bot, ShoppingCart, Bell, Cpu, BookOpen } from "lucide-react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { useAuth } from "@/hooks/useAuth";

import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { companySettings } = useSettingsContext();
  const { user, profile, signOut } = useAuth();

  const mainNavItems = [{
    title: t('dashboard'),
    href: "/dashboard",
    icon: LayoutDashboard,
    badge: null
  }, {
    title: t('projects'),
    href: "/projects",
    icon: FolderKanban,
    badge: "12"
  }, {
    title: t('analytics'),
    href: "/analytics",
    icon: BarChart3,
    badge: null
  }, {
    title: t('team'),
    href: "/team",
    icon: Users,
    badge: "30"
  }, {
    title: t('hr'),
    href: "/hr",
    icon: Users,
    badge: "89"
  }, {
    title: t('customers'),
    href: "/customers",
    icon: UserCircle,
    badge: "418"
  }];

  const businessNavItems = [{
    title: "Comunicação",
    href: "/communication",
    icon: MessageSquare,
    badge: "15"
  }, {
    title: "Multi-Sessões",
    href: "/multi-sessions",
    icon: Bot,
    badge: "4"
  }, {
    title: "Automação",
    href: "/automation",
    icon: Zap,
    badge: "12"
  }, {
    title: "Relatórios",
    href: "/reports",
    icon: FileText,
    badge: null
  }, {
    title: "Integrações",
    href: "/integrations",
    icon: LinkIcon,
    badge: "6"
  }];

  const technicalNavItems = [{
    title: "Features",
    href: "/features",
    icon: Cpu,
    badge: "PWA"
  }, {
    title: "Documentação",
    href: "/documentation",
    icon: BookOpen,
    badge: "NEW"
  }];

  const systemNavItems = [{
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    badge: null
  }];

  // Usuário
  // Define rota de perfil conforme tipo de usuário usando profile.position
  let userProfileHref = "/profile";
  let userTitle = "Usuário";
  if (profile?.position === "admin" || profile?.position === "super_admin") {
    userProfileHref = "/admin-profile";
    userTitle = "Admin";
  } else if (profile?.position === "manager") {
    userProfileHref = "/manager-profile";
    userTitle = "Manager";
  }

  const userNavItems = [
    {
      title: userTitle,
      href: userProfileHref,
      icon: UserCircle,
      badge: null
    }
  ];

  // Menu de usuário aprimorado
  const UserSection = () => (
    <div className={cn("mb-4 px-3")}> 
      <div className="flex items-center gap-3 py-2">
        <UserCircle className="h-8 w-8 text-muted-foreground" />
        {!collapsed && (
          <div className="flex flex-col">
            <span className="font-semibold text-sm leading-tight">Usuário</span>
            <span className="text-xs text-muted-foreground break-all">{user?.email || "sem email"}</span>
            {profile?.position && (
              <span className="text-xs text-muted-foreground mt-1">Cargo: {profile.position}</span>
            )}
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="mt-2 flex flex-col gap-1">
          <Separator className="my-2" />
          <NavItem item={userNavItems[0]} />
          <button
            onClick={signOut}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-destructive/80 hover:text-destructive",
              "text-destructive"
            )}
            title="Sair"
            aria-label="Sair"
          >
            <UserCircle className="h-4 w-4" />
            <span className="flex-1 text-base">Sair</span>
          </button>
        </div>
      )}
      {collapsed && (
        <div className="flex flex-col gap-1 items-center mt-2">
          <button onClick={signOut} title="Sair" aria-label="Sair" className="p-1 rounded hover:bg-destructive/80">
            <UserCircle className="h-5 w-5 text-destructive" />
          </button>
        </div>
      )}
    </div>
  );

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  type NavItemType = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string | null;
  };

  const NavItem = ({ item }: { item: NavItemType }) => (
    <Link 
      to={item.href} 
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
        isActive(item.href) && "bg-accent text-accent-foreground"
      )}
    >
      <item.icon className="h-4 w-4" />
      {!collapsed && (
        <>
          <span className="flex-1 text-base">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  // Item especial para logout
  const LogoutItem = () => (
    <button
      onClick={signOut}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-destructive/80 hover:text-destructive",
        "text-destructive"
      )}
    >
      <UserCircle className="h-4 w-4" />
      {!collapsed && <span className="flex-1 text-base">Sair</span>}
    </button>
  );

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-background transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
  {/* Header */}
  <div className="flex h-14 items-center justify-between px-4 border-b">
    {!collapsed && (
      <div className="flex items-center gap-2">
        {companySettings.logo ? (
          <img 
            src={companySettings.logo} 
            alt="Logo" 
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <span className="font-bold text-lg">{companySettings.name || "CRM Pro"}</span>
        )}
      </div>
    )}
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setCollapsed(!collapsed)}
      aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
    >
      {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
    </Button>
  </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {/* Main Navigation */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Principal
              </h2>
            </div>
          )}
          {mainNavItems.map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* Business Navigation */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Negócios
              </h2>
            </div>
          )}
          {businessNavItems.map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* Technical Navigation */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Técnico
              </h2>
            </div>
          )}
          {technicalNavItems.map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* System Navigation */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Sistema
              </h2>
            </div>
          )}
          {systemNavItems.map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* User Section aprimorado */}
          <UserSection />
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Sistema Online</span>
            </div>
            <div className="text-xs text-muted-foreground">
              v2.4.1 • © 2024 {companySettings.name || 'CRM Pro'}
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Sidebar };
