-- Script para atualizar o usuário admin existente com o novo sistema de permissões
-- Execute este script APÓS executar a migração principal

-- Atualizar o usuário lucas.magista1@gmail.com para usar o novo sistema de cargos
UPDATE public.user_roles 
SET custom_role_id = (
  SELECT id FROM public.roles WHERE name = 'Super Admin' LIMIT 1
)
WHERE user_id IN (
  SELECT id FROM public.profiles WHERE email = 'lucas.magista1@gmail.com'
);

-- Se não existir um registro em user_roles, criar um
INSERT INTO public.user_roles (user_id, role, custom_role_id)
SELECT 
  p.id,
  'admin'::user_role,
  r.id
FROM public.profiles p
CROSS JOIN public.roles r
WHERE p.email = 'lucas.magista1@gmail.com'
AND r.name = 'Super Admin'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
);

-- Verificar o resultado
SELECT 
  p.id,
  p.email,
  p.full_name,
  ur.role as enum_role,
  r.name as custom_role_name,
  r.color as role_color,
  r.is_system_role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
LEFT JOIN public.roles r ON ur.custom_role_id = r.id
WHERE p.email = 'lucas.magista1@gmail.com';
