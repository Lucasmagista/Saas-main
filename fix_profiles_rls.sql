-- Script para corrigir políticas RLS da tabela profiles
-- Este script permitirá que o sistema crie perfis automaticamente

-- Primeiro, vamos ver as políticas atuais
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Remover políticas problemáticas que podem estar bloqueando
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Política permissiva para SELECT - qualquer usuário autenticado pode ver perfis ativos
CREATE POLICY "Allow read active profiles" 
ON public.profiles 
FOR SELECT 
USING (is_active = true);

-- Política para INSERT - permitir criação automática pelo sistema
CREATE POLICY "Allow system profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (true); -- Permite inserção de qualquer perfil

-- Política para UPDATE - usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política adicional para DELETE - apenas admins ou próprio usuário
CREATE POLICY "Users can delete own profile or admin can delete any" 
ON public.profiles 
FOR DELETE 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Verificar se as políticas foram criadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Testar se consegue fazer operações básicas
SELECT 'Teste de contagem' as teste, count(*) as total FROM public.profiles;
