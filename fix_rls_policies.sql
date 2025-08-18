-- CORREÇÃO DAS POLÍTICAS RLS PARA ROLES E ROLE_PERMISSIONS
-- Execute este script no SQL Editor do Supabase Dashboard

-- Primeiro, vamos remover as políticas problemáticas
DROP POLICY IF EXISTS "Admins podem gerenciar cargos" ON public.roles;
DROP POLICY IF EXISTS "Admins podem gerenciar associações" ON public.role_permissions;

-- Recriar políticas mais simples e sem recursão
-- Política para roles - permitir que usuários vejam roles ativas
CREATE POLICY "Visualizar cargos ativos" ON public.roles
FOR SELECT USING (is_active = true);

-- Política para roles - apenas super admins podem gerenciar
CREATE POLICY "Super admins podem gerenciar cargos" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- Política para role_permissions - permitir visualização
CREATE POLICY "Visualizar associações de permissão" ON public.role_permissions
FOR SELECT USING (true);

-- Política para role_permissions - apenas super admins podem gerenciar
CREATE POLICY "Super admins podem gerenciar associações" ON public.role_permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- Verificar se as tabelas estão funcionando agora
SELECT 'roles' as tabela, count(*) as registros FROM public.roles
UNION ALL
SELECT 'permissions' as tabela, count(*) as registros FROM public.permissions
UNION ALL  
SELECT 'role_permissions' as tabela, count(*) as registros FROM public.role_permissions;
