-- SCRIPT UNIFICADO DE CRIAÇÃO DO BANCO DE DADOS (PostgreSQL local)
-- Adaptação dos scripts do projeto para ambiente local

-- 1. Enums
CREATE TYPE public.system_module AS ENUM (
  'dashboard', 'crm', 'leads', 'opportunities', 'whatsapp', 'bots', 'automations',
  'reports', 'analytics', 'users', 'roles', 'settings', 'integrations', 'billing',
  'support', 'audit_logs', 'security', 'backups', 'marketplace'
);

CREATE TYPE public.permission_type AS ENUM (
  'view', 'create', 'edit', 'delete', 'manage', 'export', 'import'
);

-- 2. Tabelas principais (exemplo: permissions, roles)
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

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- 3. Exemplo de tabela organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Exemplo de tabela profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 5. Exemplo de tabela audit_logs_v2
CREATE TABLE IF NOT EXISTS public.audit_logs_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT,
  resource_type TEXT,
  resource_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Foreign key entre audit_logs_v2 e profiles
ALTER TABLE public.audit_logs_v2
ADD CONSTRAINT fk_audit_user
FOREIGN KEY (user_id) REFERENCES public.profiles(id);

-- 7. Ajustes em system_settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID,
  key TEXT NOT NULL,
  value TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.system_settings 
DROP CONSTRAINT IF EXISTS system_settings_organization_id_fkey;
ALTER TABLE public.system_settings 
ALTER COLUMN organization_id DROP NOT NULL;
ALTER TABLE public.system_settings 
ADD CONSTRAINT system_settings_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 8. Inserir organização padrão
INSERT INTO public.organizations (name, domain, settings)
SELECT 'Organização Padrão', 'default.local', '{}'::jsonb
WHERE NOT EXISTS (
    SELECT 1 FROM public.organizations LIMIT 1
);

-- 9. Observação sobre RLS
-- As políticas de Row Level Security (RLS) e funções como auth.uid() são específicas do Supabase.
-- No PostgreSQL puro, você pode ignorar esses comandos ou implementar RLS manualmente se desejar.
-- Exemplo de ativação de RLS (opcional):
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 10. Outras tabelas e constraints
-- Adicione aqui outras tabelas e relacionamentos conforme necessário do seu projeto.

-- FIM DO SCRIPT
