-- SCRIPT COMPLETO PARA CORRIGIR PERSISTÊNCIA DO ADMIN
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos garantir que seu usuário está correto na tabela profiles
UPDATE public.profiles 
SET 
    position = 'admin',
    full_name = COALESCE(full_name, 'Lucas Magista'),
    is_active = true,
    updated_at = now()
WHERE email = 'lucas.magista1@gmail.com';

-- 2. Garantir que existe um registro em user_roles com admin
INSERT INTO public.user_roles (user_id, role)
SELECT 
    id,
    'admin'::user_role
FROM public.profiles 
WHERE email = 'lucas.magista1@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin'::user_role,
    updated_at = now();

-- 3. Se existe sistema de custom roles, associar ao Super Admin
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
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.id AND ur.custom_role_id = r.id
)
ON CONFLICT (user_id) DO UPDATE SET
    custom_role_id = (SELECT id FROM public.roles WHERE name = 'Super Admin' LIMIT 1),
    role = 'admin'::user_role,
    updated_at = now();

-- 4. Verificar RLS policies - desabilitar temporariamente para debug se necessário
-- (CUIDADO: só execute se souber o que está fazendo)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 5. Verificar o resultado final
SELECT 
    'PERFIL' as tipo,
    p.id,
    p.email,
    p.full_name,
    p.position,
    p.is_active,
    NULL as role_table,
    NULL as custom_role
FROM public.profiles p
WHERE p.email = 'lucas.magista1@gmail.com'

UNION ALL

SELECT 
    'USER_ROLE' as tipo,
    ur.user_id as id,
    p.email,
    p.full_name,
    p.position,
    p.is_active,
    ur.role as role_table,
    r.name as custom_role
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
LEFT JOIN public.roles r ON ur.custom_role_id = r.id
WHERE p.email = 'lucas.magista1@gmail.com';

-- 6. Verificar se existe algum conflito de dados
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN position = 'admin' THEN 1 END) as admin_profiles
FROM public.profiles 
WHERE email = 'lucas.magista1@gmail.com';

SELECT 
    COUNT(*) as total_roles,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admin_roles
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id
WHERE p.email = 'lucas.magista1@gmail.com';
