
-- Criação das tabelas principais para o sistema SaaS

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enum para roles do sistema
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'manager', 'user', 'viewer');

-- Tabela de roles de usuário
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tabela de organizações/empresas
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de membros da organização
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role user_role DEFAULT 'user',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Tabela de leads/contatos
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  status TEXT DEFAULT 'new',
  tags TEXT[],
  custom_fields JSONB DEFAULT '{}',
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de pipeline de vendas
CREATE TABLE public.sales_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  stages JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de oportunidades
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  pipeline_id UUID REFERENCES public.sales_pipeline(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  value DECIMAL(12,2),
  stage TEXT NOT NULL,
  probability INTEGER DEFAULT 0,
  expected_close_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de interações/atividades
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de templates de mensagens
CREATE TABLE public.message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  variables TEXT[],
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de notificações
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de logs de auditoria
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de configurações do sistema
CREATE TABLE public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, category, key)
);

-- Tabela de integrações
CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de webhooks
CREATE TABLE public.webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  secret TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de backup logs
CREATE TABLE public.backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  file_path TEXT,
  file_size BIGINT,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  error_message TEXT
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_logs ENABLE ROW LEVEL SECURITY;

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
  FROM public.organization_members
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Políticas RLS para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Políticas RLS para organizations
CREATE POLICY "Members can view their organization" ON public.organizations
  FOR SELECT USING (id = public.get_user_organization(auth.uid()));

CREATE POLICY "Admins can update organization" ON public.organizations
  FOR UPDATE USING (id = public.get_user_organization(auth.uid()) AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

-- Políticas RLS para organization_members
CREATE POLICY "Members can view organization members" ON public.organization_members
  FOR SELECT USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Admins can manage organization members" ON public.organization_members
  FOR ALL USING (organization_id = public.get_user_organization(auth.uid()) AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

-- Políticas RLS para leads
CREATE POLICY "Users can view organization leads" ON public.leads
  FOR SELECT USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can create leads" ON public.leads
  FOR INSERT WITH CHECK (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can update assigned leads" ON public.leads
  FOR UPDATE USING (organization_id = public.get_user_organization(auth.uid()) AND (assigned_to = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

CREATE POLICY "Admins can delete leads" ON public.leads
  FOR DELETE USING (organization_id = public.get_user_organization(auth.uid()) AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin')));

-- Políticas similares para as outras tabelas
CREATE POLICY "Users can view organization data" ON public.sales_pipeline
  FOR SELECT USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization opportunities" ON public.opportunities
  FOR SELECT USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization activities" ON public.activities
  FOR SELECT USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can view organization templates" ON public.message_templates
  FOR SELECT USING (organization_id = public.get_user_organization(auth.uid()));

CREATE POLICY "Users can view their notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER opportunities_updated_at
  BEFORE UPDATE ON public.opportunities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Inserir dados iniciais
INSERT INTO public.organizations (name, domain) VALUES ('Demo Company', 'demo.com');
INSERT INTO public.sales_pipeline (organization_id, name, stages) 
VALUES (
  (SELECT id FROM public.organizations WHERE name = 'Demo Company'),
  'Pipeline Principal',
  '[{"name": "Lead", "color": "#3b82f6"}, {"name": "Qualificado", "color": "#8b5cf6"}, {"name": "Proposta", "color": "#f59e0b"}, {"name": "Negociação", "color": "#ef4444"}, {"name": "Fechado", "color": "#10b981"}]'
);
