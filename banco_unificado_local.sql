-- ========================================
-- SCRIPT UNIFICADO DE CRIAÇÃO DO BANCO DE DADOS
-- PostgreSQL local - Versão Melhorada
-- ========================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. ENUMS E TIPOS
-- ========================================

-- Enum para módulos do sistema
CREATE TYPE public.system_module AS ENUM (
  'dashboard', 'crm', 'leads', 'opportunities', 'whatsapp', 'bots', 'automations',
  'reports', 'analytics', 'users', 'roles', 'settings', 'integrations', 'billing',
  'support', 'audit_logs', 'security', 'backups', 'marketplace'
);

-- Enum para tipos de permissão
CREATE TYPE public.permission_type AS ENUM (
  'view', 'create', 'edit', 'delete', 'manage', 'export', 'import'
);

-- Enum para roles de usuário
CREATE TYPE public.user_role AS ENUM (
  'user', 'manager', 'admin', 'super_admin'
);

-- Enum para status de sessão
CREATE TYPE public.session_status AS ENUM (
  'active', 'inactive', 'connecting', 'error'
);

-- Enum para direção de mensagem
CREATE TYPE public.message_direction AS ENUM (
  'sent', 'received', 'system'
);

-- ========================================
-- 2. TABELAS PRINCIPAIS
-- ========================================

-- Tabela de organizações
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de roles de usuário
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'user',
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissions (
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

-- Tabela de bots
CREATE TABLE IF NOT EXISTS public.bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  session_name TEXT,
  qrcode TEXT,
  is_active BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  description TEXT,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de sessões de bot
CREATE TABLE IF NOT EXISTS public.bot_sessions (
  session_id TEXT PRIMARY KEY,
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_message TEXT,
  status session_status DEFAULT 'inactive',
  qr_data TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de logs de bot
CREATE TABLE IF NOT EXISTS public.bot_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  direction message_direction NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  number TEXT,
  media_url TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Tabela de logs de multi-sessão
CREATE TABLE IF NOT EXISTS public.multisession_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  direction message_direction NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- Tabela de QR codes
CREATE TABLE IF NOT EXISTS public.qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID REFERENCES public.bots(id) ON DELETE CASCADE,
  qr_code TEXT NOT NULL,
  status session_status DEFAULT 'inactive',
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Tabela de webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de eventos de webhook
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  response_code INTEGER,
  response_body TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.audit_logs_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, key)
);

-- ========================================
-- 3. ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para bot_logs
CREATE INDEX IF NOT EXISTS idx_bot_logs_bot_id ON public.bot_logs(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_logs_timestamp ON public.bot_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_bot_logs_direction ON public.bot_logs(direction);
CREATE INDEX IF NOT EXISTS idx_bot_logs_number ON public.bot_logs(number);

-- Índices para multisession_logs
CREATE INDEX IF NOT EXISTS idx_multisession_logs_session_id ON public.multisession_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_multisession_logs_timestamp ON public.multisession_logs(timestamp);

-- Índices para bot_sessions
CREATE INDEX IF NOT EXISTS idx_bot_sessions_status ON public.bot_sessions(status);
CREATE INDEX IF NOT EXISTS idx_bot_sessions_bot_id ON public.bot_sessions(bot_id);

-- Índices para qr_codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_bot_id ON public.qr_codes(bot_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_status ON public.qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires_at ON public.qr_codes(expires_at);

-- Índices para webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_organization_id ON public.webhooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON public.webhooks(is_active);

-- Índices para webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_webhook_id ON public.webhook_events(webhook_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at ON public.webhook_events(created_at);

-- Índices para audit_logs_v2
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs_v2(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs_v2(created_at);

-- Índices para user_roles
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON public.user_roles(organization_id);

-- Índices para system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_organization_id ON public.system_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON public.system_settings(key);

-- ========================================
-- 4. DADOS INICIAIS
-- ========================================

-- Inserir organização padrão
INSERT INTO public.organizations (name, domain, settings)
SELECT 'Organização Padrão', 'default.local', '{}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM public.organizations LIMIT 1
);

-- Inserir permissões básicas
INSERT INTO public.permissions (name, description, module, permission_type) VALUES
('Visualizar Dashboard', 'Permite visualizar o dashboard principal', 'dashboard', 'view'),
('Gerenciar Usuários', 'Permite gerenciar usuários da organização', 'users', 'manage'),
('Visualizar Relatórios', 'Permite visualizar relatórios', 'reports', 'view'),
('Gerenciar Bots', 'Permite gerenciar bots de WhatsApp', 'bots', 'manage'),
('Enviar Mensagens', 'Permite enviar mensagens via WhatsApp', 'whatsapp', 'create'),
('Visualizar Logs', 'Permite visualizar logs do sistema', 'audit_logs', 'view')
ON CONFLICT (module, permission_type) DO NOTHING;

-- ========================================
-- 5. FUNÇÕES E TRIGGERS
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bots_updated_at BEFORE UPDATE ON public.bots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bot_sessions_updated_at BEFORE UPDATE ON public.bot_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_webhooks_updated_at BEFORE UPDATE ON public.webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para verificar se o usuário tem uma role específica
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter a organização do usuário
CREATE OR REPLACE FUNCTION public.get_user_organization(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE id = _user_id
  LIMIT 1
$$;

-- ========================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

COMMENT ON TABLE public.organizations IS 'Organizações/empresas que usam a plataforma';
COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';
COMMENT ON TABLE public.user_roles IS 'Roles e permissões dos usuários por organização';
COMMENT ON TABLE public.permissions IS 'Permissões disponíveis no sistema';
COMMENT ON TABLE public.bots IS 'Bots de WhatsApp configurados';
COMMENT ON TABLE public.bot_sessions IS 'Sessões ativas dos bots';
COMMENT ON TABLE public.bot_logs IS 'Logs de mensagens dos bots';
COMMENT ON TABLE public.multisession_logs IS 'Logs de eventos de multi-sessão';
COMMENT ON TABLE public.qr_codes IS 'QR codes gerados para autenticação';
COMMENT ON TABLE public.webhooks IS 'Webhooks configurados para integrações';
COMMENT ON TABLE public.webhook_events IS 'Eventos de webhook processados';
COMMENT ON TABLE public.audit_logs_v2 IS 'Logs de auditoria do sistema';
COMMENT ON TABLE public.system_settings IS 'Configurações do sistema por organização';

-- ========================================
-- FIM DO SCRIPT
-- ========================================

-- Para verificar se tudo foi criado corretamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
