-- Script direto para definir admin (execute no Supabase SQL Editor)

-- Atualizar diretamente a posição para admin
UPDATE public.profiles 
SET 
    position = 'admin',
    full_name = COALESCE(full_name, 'Lucas Magista'),
    is_active = true,
    updated_at = now()
WHERE email = 'lucas.magista1@gmail.com';

-- Verificar se foi atualizado
SELECT 
    id,
    email,
    full_name,
    position,
    is_active,
    created_at,
    updated_at
FROM public.profiles 
WHERE email = 'lucas.magista1@gmail.com';
