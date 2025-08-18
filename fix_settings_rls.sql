-- Script para corrigir problemas de RLS com system_settings e organizations
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Primeiro, verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('system_settings', 'organizations');

-- 2. Verificar políticas RLS existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('system_settings', 'organizations');

-- 3. Remover políticas problemáticas se existirem
DROP POLICY IF EXISTS "Users can view organization data" ON public.organizations;
DROP POLICY IF EXISTS "Members can view their organization" ON public.organizations;
DROP POLICY IF EXISTS "Admins can update organization" ON public.organizations;
DROP POLICY IF EXISTS "Users can manage system settings" ON public.system_settings;

-- 4. Criar políticas mais permissivas para system_settings
-- Permitir que usuários autenticados leiam configurações
CREATE POLICY "Allow authenticated users to read settings" ON public.system_settings
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem/atualizem configurações
CREATE POLICY "Allow authenticated users to manage settings" ON public.system_settings
    FOR ALL 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- 5. Criar políticas mais permissivas para organizations
-- Permitir que usuários autenticados leiam organizações
CREATE POLICY "Allow authenticated users to read organizations" ON public.organizations
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Permitir que usuários autenticados criem organizações (se necessário)
CREATE POLICY "Allow authenticated users to create organizations" ON public.organizations
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- 6. Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('system_settings', 'organizations') 
AND schemaname = 'public';

-- 7. Se necessário, habilitar RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- 8. Verificar se existem dados na tabela system_settings
SELECT category, key, count(*) 
FROM public.system_settings 
GROUP BY category, key;

-- 9. Teste de inserção (opcional - descomente se quiser testar)
-- INSERT INTO public.system_settings (organization_id, category, key, value) 
-- VALUES (null, 'test', 'default', '{"test": true}')
-- ON CONFLICT (organization_id, category, key) DO UPDATE SET value = EXCLUDED.value;

-- 10. Verificar constraints da tabela
SELECT conname, contype, conkey, confkey 
FROM pg_constraint 
WHERE conrelid = 'public.system_settings'::regclass;
