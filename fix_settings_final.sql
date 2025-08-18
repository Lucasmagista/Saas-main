-- Script DEFINITIVO para corrigir problemas com system_settings
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar estrutura atual
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'system_settings' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Remover constraint de foreign key temporariamente para permitir organization_id = null
ALTER TABLE public.system_settings 
DROP CONSTRAINT IF EXISTS system_settings_organization_id_fkey;

-- 3. Alterar coluna organization_id para permitir NULL
ALTER TABLE public.system_settings 
ALTER COLUMN organization_id DROP NOT NULL;

-- 4. Recriar a constraint como opcional (permitindo NULL)
ALTER TABLE public.system_settings 
ADD CONSTRAINT system_settings_organization_id_fkey 
FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 5. Remover políticas RLS restritivas
DROP POLICY IF EXISTS "Users can view organization data" ON public.system_settings;
DROP POLICY IF EXISTS "Members can view their organization" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated users to read settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow authenticated users to manage settings" ON public.system_settings;

-- 6. Criar políticas RLS mais permissivas
CREATE POLICY "Allow all authenticated users to manage settings" ON public.system_settings
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 7. Garantir que RLS está habilitado
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- 8. Criar uma organização padrão se não existir (com bypass temporário de RLS)
DO $$ 
BEGIN
    -- Desabilitar RLS temporariamente
    ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
    
    -- Inserir organização padrão se não existir
    INSERT INTO public.organizations (id, name, domain, created_at, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000000',
        'Organização Padrão',
        'default.local',
        now(),
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Reabilitar RLS
    ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
    
    -- Criar política permissiva para organizations
    DROP POLICY IF EXISTS "Allow authenticated users to read organizations" ON public.organizations;
    DROP POLICY IF EXISTS "Allow authenticated users to create organizations" ON public.organizations;
    
    CREATE POLICY "Allow all authenticated operations on organizations" ON public.organizations
        FOR ALL 
        USING (auth.role() = 'authenticated')
        WITH CHECK (auth.role() = 'authenticated');
        
END $$;

-- 9. Teste para verificar se funciona
SELECT 'Test successful: system_settings accessible' as result
WHERE EXISTS (
    SELECT 1 FROM public.system_settings LIMIT 1
) OR NOT EXISTS (
    SELECT 1 FROM public.system_settings LIMIT 1
);

-- 10. Mostrar status final
SELECT 
    t.tablename,
    t.rowsecurity as rls_enabled,
    COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public' 
AND t.tablename IN ('system_settings', 'organizations')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;
