-- Execute este script no SQL Editor do painel do Supabase
-- https://supabase.com/dashboard/project/qwddtvotgdzcswcvuqpw/sql

-- Primeiro, vamos listar a estrutura atual da tabela profiles
-- SELECT * FROM public.profiles LIMIT 5;

-- Buscar se o usuário já existe
-- SELECT * FROM auth.users WHERE email = 'lucas.magista1@gmail.com';

-- Se o usuário já existir na auth.users, vamos atualizar/criar o profile
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Buscar o UUID do usuário na tabela auth.users
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'lucas.magista1@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Se o usuário existe, atualizar/inserir o profile
        INSERT INTO public.profiles (id, email, full_name, position, is_active, created_at, updated_at)
        VALUES (
            user_uuid, 
            'lucas.magista1@gmail.com', 
            'Lucas Magista', 
            'admin', 
            true, 
            now(), 
            now()
        )
        ON CONFLICT (id) DO UPDATE SET
            position = 'admin',
            full_name = 'Lucas Magista',
            is_active = true,
            updated_at = now();
            
        RAISE NOTICE 'Perfil atualizado para admin: %', user_uuid;
    ELSE
        RAISE NOTICE 'Usuário não encontrado. Faça login primeiro para criar o usuário.';
    END IF;
END $$;

-- Verificar o resultado
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.position,
    p.is_active,
    p.created_at
FROM public.profiles p
WHERE p.email = 'lucas.magista1@gmail.com';
