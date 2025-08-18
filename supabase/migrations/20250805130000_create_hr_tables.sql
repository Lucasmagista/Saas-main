-- Tabelas de RH para dados reais


-- Tabela de vagas
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  location TEXT,
  type TEXT,
  salary TEXT,
  status TEXT DEFAULT 'active',
  description TEXT,
  requirements TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  deadline DATE
);

-- Tabela de candidatos
CREATE TABLE IF NOT EXISTS public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  applied_job_id UUID REFERENCES public.jobs(id),
  resume_url TEXT,
  stage TEXT DEFAULT 'screening',
  score NUMERIC,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de currículos
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  skills TEXT[],
  experience_years INTEGER,
  education TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de compliance
CREATE TABLE IF NOT EXISTS public.compliance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  version TEXT,
  last_update DATE,
  status TEXT DEFAULT 'active',
  compliance NUMERIC,
  assigned_employees INTEGER,
  acknowledged_by INTEGER,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_candidates_org_id ON public.candidates(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_org_id ON public.jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_compliance_org_id ON public.compliance_policies(organization_id);
