-- Migration para sistema completo de permissões por cargo
-- Execute este script no seu banco Supabase

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
  is_system_role BOOLEAN DEFAULT false, -- roles padrão do sistema não podem ser deletadas
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

-- Relatórios
('reports.view', 'Visualizar relatórios', 'reports', 'view'),
('reports.create', 'Criar relatórios personalizados', 'reports', 'create'),
('reports.export', 'Exportar relatórios', 'reports', 'export'),

-- Analytics
('analytics.view', 'Visualizar analytics', 'analytics', 'view'),
('analytics.export', 'Exportar dados de analytics', 'analytics', 'export'),

-- Usuários
('users.view', 'Visualizar usuários', 'users', 'view'),
('users.create', 'Criar usuários', 'users', 'create'),
('users.edit', 'Editar usuários', 'users', 'edit'),
('users.delete', 'Deletar usuários', 'users', 'delete'),
('users.manage', 'Gerenciar usuários (bloquear/desbloquear)', 'users', 'manage'),

-- Roles/Cargos
('roles.view', 'Visualizar cargos e permissões', 'roles', 'view'),
('roles.create', 'Criar novos cargos', 'roles', 'create'),
('roles.edit', 'Editar cargos e permissões', 'roles', 'edit'),
('roles.delete', 'Deletar cargos personalizados', 'roles', 'delete'),

-- Configurações
('settings.view', 'Visualizar configurações', 'settings', 'view'),
('settings.edit', 'Editar configurações do sistema', 'settings', 'edit'),

-- Integrações
('integrations.view', 'Visualizar integrações', 'integrations', 'view'),
('integrations.create', 'Criar integrações', 'integrations', 'create'),
('integrations.edit', 'Editar integrações', 'integrations', 'edit'),
('integrations.delete', 'Deletar integrações', 'integrations', 'delete'),

-- Billing
('billing.view', 'Visualizar faturamento', 'billing', 'view'),
('billing.manage', 'Gerenciar faturamento', 'billing', 'manage'),

-- Suporte
('support.view', 'Visualizar tickets de suporte', 'support', 'view'),
('support.create', 'Criar tickets de suporte', 'support', 'create'),
('support.edit', 'Responder tickets de suporte', 'support', 'edit'),

-- Audit Logs
('audit_logs.view', 'Visualizar logs de auditoria', 'audit_logs', 'view'),
('audit_logs.export', 'Exportar logs de auditoria', 'audit_logs', 'export'),

-- Segurança
('security.view', 'Visualizar alertas de segurança', 'security', 'view'),
('security.manage', 'Gerenciar configurações de segurança', 'security', 'manage'),

-- Backups
('backups.view', 'Visualizar status de backups', 'backups', 'view'),
('backups.create', 'Executar backups manuais', 'backups', 'create'),
('backups.manage', 'Gerenciar configurações de backup', 'backups', 'manage'),

-- Marketplace
('marketplace.view', 'Visualizar marketplace', 'marketplace', 'view'),
('marketplace.manage', 'Gerenciar itens do marketplace', 'marketplace', 'manage');

-- Inserir cargos padrão do sistema
INSERT INTO public.roles (name, description, color, is_system_role) VALUES
('Super Admin', 'Acesso total ao sistema', '#dc2626', true),
('Admin', 'Administrador do sistema', '#ea580c', true),
('Manager', 'Gerente/Coordenador', '#ca8a04', true),
('User', 'Usuário padrão', '#2563eb', true),
('Viewer', 'Apenas visualização', '#64748b', true);

-- Atribuir todas as permissões para Super Admin
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Super Admin';

-- Atribuir permissões para Admin (tudo exceto algumas específicas de super admin)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Admin'
AND p.name NOT IN ('roles.delete', 'security.manage', 'backups.manage');

-- Atribuir permissões para Manager (visualização e gerenciamento básico)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'Manager'
AND p.permission_type IN ('view', 'create', 'edit')
AND p.module NOT IN ('users', 'roles', 'security', 'backups', 'settings');

-- Atribuir permissões para User (operações básicas)
INSERT INTO public.role_permissions (role_id, permission_id, granted)
SELECT r.id, p.id, true
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'User'
AND p.permission_type IN ('view', 'create', 'edit')
AND p.module IN ('dashboard', 'crm', 'leads', 'opportunities', 'whatsapp', 'reports');

-- Atribuir permissões para Viewer (apenas visualização)
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

-- Políticas RLS para permissions
CREATE POLICY "Users can view permissions" ON public.permissions
  FOR SELECT USING (true);

-- Políticas RLS para roles
CREATE POLICY "Users can view roles" ON public.roles
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage roles" ON public.roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.custom_role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Super Admin', 'Admin')
    )
  );

-- Políticas RLS para role_permissions
CREATE POLICY "Users can view role permissions" ON public.role_permissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage role permissions" ON public.role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON ur.custom_role_id = r.id
      WHERE ur.user_id = auth.uid()
      AND r.name IN ('Super Admin', 'Admin')
    )
  );

-- Função para verificar se um usuário tem uma permissão específica
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

-- Função para obter todas as permissões de um usuário
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

-- Função para obter o cargo personalizado de um usuário
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
