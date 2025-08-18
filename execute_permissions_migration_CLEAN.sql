-- SCRIPT CORRIGIDO - LIMPA E RECRIA TUDO DO ZERO
-- Execute este script no SQL Editor do Supabase Dashboard

-- PRIMEIRO: Remover tudo que pode existir (sem erro se não existir)

-- Remover TODAS as políticas RLS existentes (incluindo as que dependem de custom_role_id)
DROP POLICY IF EXISTS "Usuários podem visualizar permissões ativas" ON public.permissions;
DROP POLICY IF EXISTS "Usuários podem visualizar cargos ativos" ON public.roles;
DROP POLICY IF EXISTS "Usuários podem visualizar associações de permissão" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins podem gerenciar permissões" ON public.permissions;
DROP POLICY IF EXISTS "Admins podem gerenciar cargos" ON public.roles;
DROP POLICY IF EXISTS "Admins podem gerenciar associações" ON public.role_permissions;
DROP POLICY IF EXISTS "Visualizar permissões ativas" ON public.permissions;
DROP POLICY IF EXISTS "Visualizar cargos ativos" ON public.roles;
DROP POLICY IF EXISTS "Visualizar associações de permissão" ON public.role_permissions;
DROP POLICY IF EXISTS "Admins gerenciam permissões" ON public.permissions;
DROP POLICY IF EXISTS "Admins gerenciam cargos" ON public.roles;
DROP POLICY IF EXISTS "Admins gerenciam associações" ON public.role_permissions;
DROP POLICY IF EXISTS "Super admins podem gerenciar cargos" ON public.roles;
DROP POLICY IF EXISTS "Super admins podem gerenciar associações" ON public.role_permissions;
-- Remover qualquer política que possa usar custom_role_id
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON public.role_permissions;

-- Remover triggers existentes
DROP TRIGGER IF EXISTS update_permissions_updated_at ON public.permissions;
DROP TRIGGER IF EXISTS update_roles_updated_at ON public.roles;

-- Remover funções existentes
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP FUNCTION IF EXISTS public.user_has_permission(UUID, TEXT);
DROP FUNCTION IF EXISTS public.get_user_permissions(UUID);
DROP FUNCTION IF EXISTS public.get_user_custom_role(UUID);

-- Remover coluna se existir (agora que as políticas foram removidas)
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS custom_role_id CASCADE;

-- Remover tabelas se existirem (em ordem para respeitar foreign keys)
DROP TABLE IF EXISTS public.role_permissions;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.permissions;

-- Remover tipos se existirem
DROP TYPE IF EXISTS public.permission_type;
DROP TYPE IF EXISTS public.system_module;

-- SEGUNDO: Recriar tudo do zero

-- Criar enum para módulos do sistema
CREATE TYPE public.system_module AS ENUM (
  'dashboard',
  'crm',
  'leads',
  'opportunities', 
  'whatsapp',
  'bots',
  'automations',
  'reports',
  'analytics',
  'users',
  'roles',
  'settings',
  'integrations',
  'billing',
  'support',
  'audit_logs',
  'security',
  'backups',
  'marketplace'
);

-- Criar enum para tipos de permissão
CREATE TYPE public.permission_type AS ENUM (
  'view',
  'create', 
  'edit',
  'delete',
  'manage',
  'export',
  'import'
);

-- Tabela de permissões disponíveis no sistema
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  module system_module NOT NULL,
  permission_type permission_type NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module, permission_type)
);

-- Tabela de cargos/roles customizáveis
CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6366f1',
  is_system_role BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de associação role-permissão
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

-- Atualizar tabela user_roles para usar as novas roles customizáveis
ALTER TABLE public.user_roles 
ADD COLUMN custom_role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL;

-- Inserir permissões padrão do sistema
INSERT INTO public.permissions (name, description, module, permission_type) VALUES
-- Dashboard
('dashboard.view', 'Visualizar dashboard principal', 'dashboard', 'view'),
('dashboard.manage', 'Gerenciar widgets do dashboard', 'dashboard', 'manage'),

-- CRM
('crm.view', 'Visualizar CRM', 'crm', 'view'),
('crm.create', 'Criar registros no CRM', 'crm', 'create'),
('crm.edit', 'Editar registros no CRM', 'crm', 'edit'),
('crm.delete', 'Deletar registros no CRM', 'crm', 'delete'),
('crm.export', 'Exportar dados do CRM', 'crm', 'export'),

-- Leads
('leads.view', 'Visualizar leads', 'leads', 'view'),
('leads.create', 'Criar leads', 'leads', 'create'),
('leads.edit', 'Editar leads', 'leads', 'edit'),
('leads.delete', 'Deletar leads', 'leads', 'delete'),
('leads.export', 'Exportar leads', 'leads', 'export'),
('leads.import', 'Importar leads', 'leads', 'import'),

-- Oportunidades
('opportunities.view', 'Visualizar oportunidades', 'opportunities', 'view'),
('opportunities.create', 'Criar oportunidades', 'opportunities', 'create'),
('opportunities.edit', 'Editar oportunidades', 'opportunities', 'edit'),
('opportunities.delete', 'Deletar oportunidades', 'opportunities', 'delete'),
('opportunities.manage', 'Gerenciar pipeline de vendas', 'opportunities', 'manage'),

-- WhatsApp
('whatsapp.view', 'Visualizar conversas WhatsApp', 'whatsapp', 'view'),
('whatsapp.create', 'Enviar mensagens WhatsApp', 'whatsapp', 'create'),
('whatsapp.manage', 'Gerenciar conexões WhatsApp', 'whatsapp', 'manage'),

-- Bots
('bots.view', 'Visualizar bots', 'bots', 'view'),
('bots.create', 'Criar bots', 'bots', 'create'),
('bots.edit', 'Editar bots', 'bots', 'edit'),
('bots.delete', 'Deletar bots', 'bots', 'delete'),
('bots.manage', 'Gerenciar configurações de bots', 'bots', 'manage'),

-- Automações
('automations.view', 'Visualizar automações', 'automations', 'view'),
('automations.create', 'Criar automações', 'automations', 'create'),
('automations.edit', 'Editar automações', 'automations', 'edit'),
('automations.delete', 'Deletar automações', 'automations', 'delete'),
('automations.manage', 'Gerenciar configurações de automação', 'automations', 'manage'),

-- Relatórios
('reports.view', 'Visualizar relatórios', 'reports', 'view'),
('reports.create', 'Criar relatórios', 'reports', 'create'),
('reports.export', 'Exportar relatórios', 'reports', 'export'),

-- Analytics
('analytics.view', 'Visualizar analytics', 'analytics', 'view'),
('analytics.manage', 'Gerenciar configurações de analytics', 'analytics', 'manage'),

-- Usuários
('users.view', 'Visualizar usuários', 'users', 'view'),
('users.create', 'Criar usuários', 'users', 'create'),
('users.edit', 'Editar usuários', 'users', 'edit'),
('users.delete', 'Deletar usuários', 'users', 'delete'),
('users.manage', 'Gerenciar configurações de usuários', 'users', 'manage'),

-- Cargos/Roles
('roles.view', 'Visualizar cargos', 'roles', 'view'),
('roles.create', 'Criar cargos', 'roles', 'create'),
('roles.edit', 'Editar cargos', 'roles', 'edit'),
('roles.delete', 'Deletar cargos', 'roles', 'delete'),
('roles.manage', 'Gerenciar permissões de cargos', 'roles', 'manage'),

-- Configurações
('settings.view', 'Visualizar configurações', 'settings', 'view'),
('settings.edit', 'Editar configurações', 'settings', 'edit'),
('settings.manage', 'Gerenciar configurações do sistema', 'settings', 'manage'),

-- Integrações
('integrations.view', 'Visualizar integrações', 'integrations', 'view'),
('integrations.create', 'Criar integrações', 'integrations', 'create'),
('integrations.edit', 'Editar integrações', 'integrations', 'edit'),
('integrations.delete', 'Deletar integrações', 'integrations', 'delete'),
('integrations.manage', 'Gerenciar configurações de integração', 'integrations', 'manage'),

-- Faturamento
('billing.view', 'Visualizar faturamento', 'billing', 'view'),
('billing.manage', 'Gerenciar faturamento', 'billing', 'manage'),
('billing.export', 'Exportar dados de faturamento', 'billing', 'export'),

-- Suporte
('support.view', 'Visualizar tickets de suporte', 'support', 'view'),
('support.create', 'Criar tickets de suporte', 'support', 'create'),
('support.edit', 'Editar tickets de suporte', 'support', 'edit'),
('support.manage', 'Gerenciar sistema de suporte', 'support', 'manage'),

-- Audit Logs
('audit_logs.view', 'Visualizar logs de auditoria', 'audit_logs', 'view'),
('audit_logs.export', 'Exportar logs de auditoria', 'audit_logs', 'export'),

-- Segurança
('security.view', 'Visualizar configurações de segurança', 'security', 'view'),
('security.manage', 'Gerenciar configurações de segurança', 'security', 'manage'),

-- Backups
('backups.view', 'Visualizar backups', 'backups', 'view'),
('backups.create', 'Criar backups', 'backups', 'create'),
('backups.manage', 'Gerenciar configurações de backup', 'backups', 'manage'),

-- Marketplace
('marketplace.view', 'Visualizar marketplace', 'marketplace', 'view'),
('marketplace.manage', 'Gerenciar marketplace', 'marketplace', 'manage');

-- Inserir cargos padrão do sistema
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('Super Admin', 'Acesso total ao sistema', '#ef4444', true),
('Admin', 'Administrador com acesso a maioria das funcionalidades', '#f59e0b', true),
('Manager', 'Gerente com acesso a recursos de gestão', '#3b82f6', true),
('Agent', 'Agente com acesso a funcionalidades operacionais', '#10b981', true),
('Viewer', 'Visualizador com acesso apenas de leitura', '#6366f1', true);

-- Configurar permissões para Super Admin (todas as permissões)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Super Admin';

-- Configurar permissões para Admin (quase todas, exceto algumas críticas)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Admin'
AND p.name NOT IN ('users.delete', 'roles.delete', 'security.manage', 'backups.manage');

-- Configurar permissões para Manager (gestão básica)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Manager'
AND p.module IN ('dashboard', 'crm', 'leads', 'opportunities', 'reports', 'analytics')
AND p.permission_type IN ('view', 'create', 'edit', 'export');

-- Configurar permissões para Agent (operacional)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Agent'
AND p.module IN ('dashboard', 'crm', 'leads', 'whatsapp', 'bots')
AND p.permission_type IN ('view', 'create', 'edit');

-- Configurar permissões para Viewer (apenas visualização)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Viewer'
AND p.permission_type = 'view';

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS SIMPLES (sem recursão)
CREATE POLICY "Visualizar permissões ativas" ON public.permissions
FOR SELECT USING (is_active = true);

CREATE POLICY "Visualizar cargos ativos" ON public.roles
FOR SELECT USING (is_active = true);

CREATE POLICY "Visualizar associações de permissão" ON public.role_permissions
FOR SELECT USING (true);

-- Políticas para admins (usando role enum simples)
CREATE POLICY "Admins gerenciam permissões" ON public.permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins gerenciam cargos" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

CREATE POLICY "Admins gerenciam associações" ON public.role_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- Funções SQL
CREATE OR REPLACE FUNCTION public.user_has_permission(_user_id UUID, _permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.custom_role_id = rp.role_id
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
    AND p.name = _permission_name
    AND rp.granted = true
    AND p.is_active = true
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(permission_name TEXT, module system_module, permission_type permission_type)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT DISTINCT p.name, p.module, p.permission_type
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.custom_role_id = rp.role_id
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
  AND rp.granted = true
  AND p.is_active = true
$$;

CREATE OR REPLACE FUNCTION public.get_user_custom_role(_user_id UUID)
RETURNS TABLE(role_id UUID, role_name TEXT, role_color TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT r.id, r.name, r.color
  FROM public.user_roles ur
  JOIN public.roles r ON ur.custom_role_id = r.id
  WHERE ur.user_id = _user_id
  AND r.is_active = true
  LIMIT 1
$$;

-- Função de trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar resultado final
SELECT 
  'permissions' as tabela, 
  count(*) as registros 
FROM public.permissions
UNION ALL
SELECT 
  'roles' as tabela, 
  count(*) as registros 
FROM public.roles
UNION ALL  
SELECT 
  'role_permissions' as tabela, 
  count(*) as registros 
FROM public.role_permissions;
