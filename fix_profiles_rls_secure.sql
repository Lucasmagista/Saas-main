-- Versão mais segura das políticas RLS para profiles
-- Permite criação automática mas mantém segurança

-- Ver políticas atuais
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Desabilitar RLS temporariamente para limpeza (apenas se necessário)
-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Allow read active profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow system profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile or admin can delete any" ON public.profiles;

-- Reabilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para SELECT - usuários autenticados podem ver perfis ativos
CREATE POLICY "profiles_select_policy" 
ON public.profiles 
FOR SELECT 
USING (
  is_active = true AND (
    auth.uid() IS NOT NULL OR  -- Usuário autenticado
    current_setting('role') = 'service_role'  -- Service role
  )
);

-- Política para INSERT - mais permissiva para permitir criação automática
CREATE POLICY "profiles_insert_policy" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Permite inserção se:
  auth.uid() = id OR  -- Usuário criando seu próprio perfil
  current_setting('role') = 'service_role' OR  -- Service role
  auth.uid() IS NULL  -- Permite criação automática durante signup
);

-- Política para UPDATE - apenas próprio perfil ou admin
CREATE POLICY "profiles_update_policy" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id OR current_setting('role') = 'service_role')
WITH CHECK (auth.uid() = id OR current_setting('role') = 'service_role');

-- Política para DELETE - apenas admin ou próprio usuário
CREATE POLICY "profiles_delete_policy" 
ON public.profiles 
FOR DELETE 
USING (
  auth.uid() = id OR 
  current_setting('role') = 'service_role' OR
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'
  )
);

-- Verificar políticas criadas
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;
