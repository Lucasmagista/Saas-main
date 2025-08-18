-- Migration para corrigir usuários sem perfil
-- Este script cria perfis para usuários que existem em auth.users mas não em public.profiles

-- Função para criar perfis automaticamente para usuários existentes
CREATE OR REPLACE FUNCTION fix_users_without_profile()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  profile_count INTEGER;
BEGIN
  -- Buscar usuários do auth.users que não têm perfil em public.profiles
  FOR user_record IN 
    SELECT au.id, au.email, au.raw_user_meta_data
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  LOOP
    -- Criar perfil para o usuário
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      is_active, 
      created_at, 
      updated_at
    ) VALUES (
      user_record.id,
      user_record.email,
      COALESCE(
        user_record.raw_user_meta_data->>'full_name',
        user_record.raw_user_meta_data->>'name',
        split_part(user_record.email, '@', 1)
      ),
      true,
      now(),
      now()
    );

    -- Criar role padrão para o usuário
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (user_record.id, 'user', now())
    ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Perfil criado para usuário: %', user_record.email;
  END LOOP;

  -- Contar perfis criados
  SELECT COUNT(*) INTO profile_count 
  FROM public.profiles;
  
  RAISE NOTICE 'Total de perfis após correção: %', profile_count;
END;
$$;

-- Executar a correção
SELECT fix_users_without_profile();

-- Verificar resultado
SELECT 
  'auth.users' as tabela, 
  COUNT(*) as total 
FROM auth.users
UNION ALL
SELECT 
  'public.profiles' as tabela, 
  COUNT(*) as total 
FROM public.profiles
UNION ALL
SELECT 
  'public.user_roles' as tabela, 
  COUNT(*) as total 
FROM public.user_roles;

-- Garantir que o trigger funciona para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Criar perfil
  INSERT INTO public.profiles (id, email, full_name, is_active, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    true,
    now(),
    now()
  );
  
  -- Criar role padrão
  INSERT INTO public.user_roles (user_id, role, created_at)
  VALUES (NEW.id, 'user', now())
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentários finais
COMMENT ON FUNCTION fix_users_without_profile() IS 'Função para corrigir usuários existentes sem perfil na tabela profiles';
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger function para criar perfil automaticamente para novos usuários';
