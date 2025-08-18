-- Migration para definir lucas.magista1@gmail.com como admin
-- Execute este script no seu banco Supabase

-- Primeiro, vamos verificar se o usuário já existe na tabela de profiles
-- Se não existir, vamos criá-lo

-- Insere/atualiza o perfil do usuário admin
INSERT INTO public.profiles (id, email, full_name, position, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(), 
  'lucas.magista1@gmail.com', 
  'Lucas Magista', 
  'admin', 
  true, 
  now(), 
  now()
)
ON CONFLICT (email) DO UPDATE SET
  position = 'admin',
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
  is_active = true,
  updated_at = now();

-- Garantir que existe uma role de admin para este usuário
INSERT INTO public.user_roles (user_id, role, created_at)
SELECT p.id, 'admin'::user_role, now()
FROM public.profiles p 
WHERE p.email = 'lucas.magista1@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Verificar o resultado
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.position,
  ur.role as user_role,
  p.is_active
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'lucas.magista1@gmail.com';
