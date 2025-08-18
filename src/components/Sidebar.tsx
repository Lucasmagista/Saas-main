import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LayoutDashboard, FolderKanban, BarChart3, Users, Settings, UserCircle, MessageSquare, Zap, FileText, Mail, Link as LinkIcon, ChevronLeft, ChevronRight, Bot, ShoppingCart, Bell, Cpu, BookOpen, Target, DollarSign, Building2, Globe, Cog, Eye } from "lucide-react";
import { useSettingsContext } from "@/contexts/SettingsContext";
import { useAuth } from "@/hooks/useAuth";
import { OnboardingPrompt } from "@/components/onboarding/OnboardingPrompt";

import { useTranslation } from 'react-i18next';

const Sidebar = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { companySettings } = useSettingsContext();
  const { user, profile, logout } = useAuth();

  // Definição do tipo para os itens do sidebar. Cada item pode opcionalmente
  // especificar as roles permitidas. Quando omitido, qualquer usuário
  // autenticado pode visualizá-lo.
  type SidebarItem = {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string | null;
    roles?: string[];
  };

  // Normalizar cargo do usuário para minúsculo para comparação com lista de roles
  const userRole = profile?.position?.toLowerCase();

  // Função utilitária para filtrar itens conforme roles. Quando a propriedade
  // `roles` é undefined, o item é considerado público e será exibido para
  // qualquer usuário autenticado. Caso `roles` seja definido, o usuário deve
  // possuir um cargo incluído na lista para visualizar o item.
  const filterByRole = (items: SidebarItem[]) => {
    // TEMPORÁRIO: Para lucas.magista1@gmail.com, mostrar todos os itens
    if (user?.email === 'lucas.magista1@gmail.com') {
      return items;
    }
    
    return items.filter(item => {
      if (!item.roles) return true;
      // Se não houver role no perfil, negar itens restritos
      if (!userRole) return false;
      return item.roles.includes(userRole);
    });
  };



  // Definição das rotas principais com roles permitidas. Quando roles for
  // undefined, qualquer usuário autenticado pode vê-la. Roles devem
  // corresponder a profile.position transformado em lowercase.
  const mainNavItems: SidebarItem[] = [
    { title: t('dashboard'), href: "/dashboard", icon: LayoutDashboard, badge: null, roles: undefined },
    { title: "CRM", href: "/crm", icon: Target, badge: "12", roles: ['comercial','crm','admin','manager'] },
    { title: t('team'), href: "/team", icon: Users, badge: "30", roles: ['manager','admin','hr','ceo'] },
    { title: t('hr'), href: "/hr", icon: Users, badge: "89", roles: ['hr','admin','ceo'] },
    { title: t('customers'), href: "/customers", icon: UserCircle, badge: "418", roles: ['comercial','crm','admin','manager','ceo'] }
  ];

  const businessNavItems: SidebarItem[] = [
    { title: t('communication'), href: "/communication", icon: MessageSquare, badge: "15", roles: ['assistencia','comercial','support','admin','manager','ceo'] },
    { title: "Multi-Sessions", href: "/multi-sessions", icon: Bot, badge: "4", roles: ['assistencia','support','admin','manager','ceo'] },
    { title: "Bots", href: "/bots", icon: Bot, badge: null, roles: ['admin','manager','ceo','assistencia','support'] },
    { title: t('automation'), href: "/automation", icon: Zap, badge: "12", roles: ['admin','manager','it','ceo'] },
    { title: "Billing", href: "/billing", icon: DollarSign, badge: null, roles: ['financeiro','admin','ceo'] },
    { title: t('reports'), href: "/reports", icon: FileText, badge: null, roles: ['ceo','admin','manager'] },
    { title: t('integrations'), href: "/integrations", icon: LinkIcon, badge: "6", roles: ['admin','ceo','it','manager'] }
  ];

  const technicalNavItems: SidebarItem[] = [
    { title: t('documentation'), href: "/documentation", icon: BookOpen, badge: "NEW", roles: undefined },
    { title: "Features", href: "/features", icon: Cpu, badge: "PWA", roles: ['admin','developer','it'] }
  ];

  const systemNavItems: SidebarItem[] = [
    { title: t('settings'), href: "/settings", icon: Settings, badge: null, roles: ['admin','ceo','manager'] }
  ];

  // Usuário
  // Define rota de perfil conforme tipo de usuário usando profile.position
  let userProfileHref = "/profile";
  let userTitle = t('user');
  const position = profile?.position?.toLowerCase();
  if (position === "admin" || position === "super_admin" || position === "super admin" || position === "ceo") {
    userProfileHref = "/admin-profile";
    userTitle = t('admin');
  } else if (position === "manager") {
    userProfileHref = "/manager-profile";
    userTitle = t('manager');
  }

  const userNavItems = [
    { title: userTitle, href: userProfileHref, icon: UserCircle, badge: null }
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
            onClick={logout}
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
          <button onClick={logout} title="Sair" aria-label="Sair" className="p-1 rounded hover:bg-destructive/80">
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

  const NavItem = ({ item }: { item: NavItemType }) => {
    
    const handleClick = (e: React.MouseEvent) => {
      console.log('NavItem clicked:', item.href, 'Current user:', user?.email);
      // Não prevenir o comportamento padrão - deixar o React Router lidar com isso
    };
    
    return (
      <Link 
        to={item.href} 
        onClick={handleClick}
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
  };

  // Item especial para logout
  const LogoutItem = () => (
    <button
      onClick={logout}
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
          <>
            <img 
              src={companySettings.logo} 
              alt="Logo" 
              className="h-8 w-8 rounded-lg object-cover"
            />
            <span className="font-bold text-lg ml-2">{companySettings.name || "Inaugurar Lar"}</span>
          </>
        ) : (
          <span className="font-bold text-lg">{companySettings.name || "Inaugurar Lar"}</span>
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
                MAIN SECTION
              </h2>
            </div>
          )}
          {filterByRole(mainNavItems).map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* Business Navigation */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                BUSINESS SECTION
              </h2>
            </div>
          )}
          {filterByRole(businessNavItems).map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* Technical Navigation */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                TECHNICAL SECTION
              </h2>
            </div>
          )}
          {filterByRole(technicalNavItems).map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* System Navigation */}
          {!collapsed && (
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                SYSTEM SECTION
              </h2>
            </div>
          )}
          {filterByRole(systemNavItems).map(item => <NavItem key={item.href} item={item} />)}

          <Separator className="my-4" />

          {/* User Section aprimorado */}
          <UserSection />
          {/* Removido seletor de idioma da Sidebar. A troca de idioma será feita nas configurações. */}
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
              v2.4.1 • © 2024 {companySettings.name || 'Inaugurar Lar'}
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
