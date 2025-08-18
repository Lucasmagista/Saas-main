-- Migração para adicionar campos necessários para o onboarding
-- Adiciona campos que estão sendo usados no sistema de onboarding

-- Adicionar campos do onboarding à tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_size TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt-BR';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_email BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_push BOOLEAN DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notifications_sms BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Atualizar usuários existentes para marcar como necessitando onboarding
UPDATE public.profiles 
SET profile_completed = false 
WHERE profile_completed IS NULL;

-- Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON public.profiles(profile_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);
CREATE INDEX IF NOT EXISTS idx_profiles_department ON public.profiles(department);

-- Atualizar trigger de updated_at se necessário
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Garantir que o trigger está ativo na tabela profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.location IS 'Localização/cidade do usuário';
COMMENT ON COLUMN public.profiles.bio IS 'Biografia/descrição do usuário';
COMMENT ON COLUMN public.profiles.company_name IS 'Nome da empresa onde trabalha';
COMMENT ON COLUMN public.profiles.company_size IS 'Tamanho da empresa (1-10, 11-50, 51-200, 201-1000, 1000+)';
COMMENT ON COLUMN public.profiles.industry IS 'Setor/indústria da empresa';
COMMENT ON COLUMN public.profiles.timezone IS 'Fuso horário do usuário';
COMMENT ON COLUMN public.profiles.language IS 'Idioma preferido do usuário';
COMMENT ON COLUMN public.profiles.notifications_email IS 'Receber notificações por email';
COMMENT ON COLUMN public.profiles.notifications_push IS 'Receber notificações push';
COMMENT ON COLUMN public.profiles.notifications_sms IS 'Receber notificações por SMS';
COMMENT ON COLUMN public.profiles.profile_completed IS 'Se o perfil foi completado no onboarding';
COMMENT ON COLUMN public.profiles.onboarding_completed_at IS 'Data e hora que o onboarding foi concluído';
