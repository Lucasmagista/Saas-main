/**
 * Script para melhorar a criação automática de perfis
 * Corrige a lógica do getUserById para ser mais robusta
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_KEY
);

async function testProfileCreation() {
  console.log('🔧 Testando criação automática de perfil...\n');

  try {
    // Simular o processo que acontece no getUserById
    // Vamos usar um UUID válido para testar se consegue criar
    const testUserId = '12345678-1234-1234-1234-123456789012';
    
    console.log('📋 Testando inserção na tabela profiles...');
    
    // Testar criação de perfil
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: `test-${testUserId.slice(-8)}@test.com`,
        full_name: 'Usuário Teste',
        position: 'user',
        is_active: true
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar perfil:', createError);
      console.log('Código do erro:', createError.code);
      console.log('Detalhes:', createError.details);
      console.log('Hint:', createError.hint);
      return false;
    }

    console.log('✅ Perfil criado com sucesso:', newProfile);

    // Testar criação de role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: testUserId,
        role: 'user'
      });

    if (roleError && roleError.code !== '23505') {
      console.error('❌ Erro ao criar role:', roleError);
    } else {
      console.log('✅ Role criada com sucesso');
    }

    // Limpar dados de teste
    await supabase.from('user_roles').delete().eq('user_id', testUserId);
    await supabase.from('profiles').delete().eq('id', testUserId);
    console.log('🧹 Dados de teste removidos');

    return true;
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    return false;
  }
}

async function checkRLSPolicies() {
  console.log('\n🔍 Verificando políticas RLS...\n');

  try {
    // Testar se consegue ler profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Erro ao ler profiles:', error.message);
      return false;
    }

    console.log('✅ Consegue ler profiles');

    // Testar se consegue ler user_roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('count')
      .limit(1);

    if (rolesError) {
      console.error('❌ Erro ao ler user_roles:', rolesError.message);
      return false;
    }

    console.log('✅ Consegue ler user_roles');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar RLS:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando diagnóstico de criação de perfis...\n');

  const rlsOk = await checkRLSPolicies();
  if (!rlsOk) {
    console.log('\n❌ Problemas com políticas RLS detectados');
    console.log('💡 Execute o script fix_rls_policies.sql no Supabase Dashboard');
    return;
  }

  const creationOk = await testProfileCreation();
  if (!creationOk) {
    console.log('\n❌ Problemas com criação automática de perfis detectados');
    console.log('💡 Verifique as permissões da tabela profiles');
    return;
  }

  console.log('\n✅ Sistema de criação automática de perfis está funcionando!');
  console.log('💡 O problema pode estar em outro lugar. Verifique os logs do servidor.');
}

main().catch(console.error);
