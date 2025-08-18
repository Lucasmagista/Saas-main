# Correção do Erro de Autenticação - "JSON object requested, multiple (or no) rows returned"

## Problema Identificado

O erro ocorria quando usuários tentavam acessar `/api/auth/me` mas não possuíam um perfil correspondente na tabela `profiles`. Isso acontecia porque:

1. O usuário existe em `auth.users` (sistema de autenticação do Supabase)
2. Mas não tem registro correspondente em `public.profiles`
3. A query `getUserById()` usava `.single()` que falha quando não encontra exatamente 1 resultado

## Solução Implementada

### 1. Correção da Função `getUserById`

**Arquivo:** `backend/repositories/authRepository.cjs`

A função foi modificada para:
- Detectar quando um perfil não existe (erro `PGRST116`)
- Criar automaticamente um perfil temporário
- Fornecer dados padrão para o usuário poder prosseguir
- Solicitar completar o perfil posteriormente via onboarding

### 2. Estratégia de Criação de Perfil

```javascript
// Se perfil não existe, cria com dados mínimos
if (profileError && profileError.code === 'PGRST116') {
  const newProfile = await supabase.from('profiles').insert({
    id: userId,
    email: `user-${userId.slice(0, 8)}@placeholder.com`, // Email temporário
    full_name: 'Usuário', // Nome temporário  
    is_active: true,
    profile_completed: false // Marca como incompleto
  });
}
```

### 3. Benefícios da Abordagem

- ✅ **Não quebra o fluxo de login** - usuário consegue entrar no sistema
- ✅ **Compatível com RLS** - não requer permissões especiais de admin
- ✅ **Graceful degradation** - se falha a criação, retorna erro explicativo
- ✅ **Integra com onboarding** - sinaliza que perfil precisa ser completado

## Como Testar

### 1. Verificar Estado Atual
```bash
node check-state.cjs
```
Mostra quantos perfis existem vs usuários no auth.

### 2. Testar Correção
```bash
node test-auth-correction.cjs
```
Simula o fluxo de correção automática.

### 3. Teste Real
1. Acesse o frontend
2. Tente fazer login com qualquer usuário
3. O sistema deve:
   - Criar perfil automaticamente se não existir
   - Redirecionar para onboarding se `profile_completed = false`
   - Funcionar normalmente se perfil já existe

## Logs Para Monitorar

### Backend Logs
```
Perfil não encontrado, criando automaticamente para usuário: [UUID]
Perfil temporário criado. Usuário deve completar dados no primeiro login.
```

### Frontend Logs  
```
✅ Usuário autenticado com sucesso
⚠️  Perfil incompleto, redirecionando para onboarding
```

## Arquivos Modificados

1. ✅ `backend/repositories/authRepository.cjs` - Função principal corrigida
2. ✅ `WEBSOCKET_IMPROVEMENTS_README.md` - Documentação WebSocket
3. ✅ Scripts de debug e teste criados

## Próximos Passos

### 1. Melhorar Onboarding
- Detectar `profile_completed = false`
- Solicitar dados reais (email, nome, etc.)
- Atualizar perfil com informações completas

### 2. Migração de Dados Existentes
Se existirem usuários em `auth.users` sem perfil:
```sql
-- Executar no Supabase SQL Editor
SELECT fix_users_without_profile();
```

### 3. Monitoramento
- Implementar métricas de perfis criados automaticamente
- Alertas para muitas criações automáticas (pode indicar problema no trigger)

## Troubleshooting

### Erro: "new row violates row-level security policy"
- **Causa:** Políticas RLS muito restritivas
- **Solução:** Revisar políticas na tabela `profiles` 
- **Workaround:** Usuário deve completar cadastro via interface

### Erro: "User not allowed"
- **Causa:** Tentativa de buscar dados do `auth.users` sem permissão
- **Solução:** Nossa correção evita isso usando dados temporários

### Perfis com email placeholder
- **Normal:** `user-12345678@placeholder.com`
- **Ação:** Usuário deve atualizar via onboarding
- **Como detectar:** `profile_completed = false`

## Conclusão

A correção resolve o erro HTTP 500 permitindo que usuários façam login mesmo sem perfil pré-existente. O sistema cria automaticamente dados temporários e solicita completar as informações posteriormente, mantendo a experiência fluida.
