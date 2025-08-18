/**
 * Script para verificar o estado atual das tabelas e RLS
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function checkCurrentState() {
  console.log('🔍 Verificando estado atual das tabelas...\n');

  try {
    // 1. Verificar profiles existentes
    console.log('1. Verificando tabela profiles:');
    const { data: profiles, error: profilesError, count: profilesCount } = await supabase
      .from('profiles')
      .select('id, email, full_name', { count: 'exact' });

    if (profilesError) {
      console.log('❌ Erro ao acessar profiles:', profilesError.message);
      console.log('   Código:', profilesError.code);
      console.log('   Detalhes:', profilesError.details);
    } else {
      console.log(`✅ Profiles encontrados: ${profilesCount || 0}`);
      if (profiles && profiles.length > 0) {
        profiles.forEach(p => {
          console.log(`   - ${p.email} (${p.id})`);
        });
      }
    }

    // 2. Verificar user_roles
    console.log('\n2. Verificando tabela user_roles:');
    const { data: roles, error: rolesError, count: rolesCount } = await supabase
      .from('user_roles')
      .select('user_id, role', { count: 'exact' });

    if (rolesError) {
      console.log('❌ Erro ao acessar user_roles:', rolesError.message);
    } else {
      console.log(`✅ Roles encontrados: ${rolesCount || 0}`);
      if (roles && roles.length > 0) {
        roles.forEach(r => {
          console.log(`   - ${r.user_id}: ${r.role}`);
        });
      }
    }

    // 3. Tentar uma query de teste para ver se o problema persiste
    console.log('\n3. Testando consulta que falha no /api/auth/me:');
    
    // Simular a consulta que está falhando
    const testUserId = 'b5c4a2e1-1234-5678-9abc-def012345678';
    
    try {
      const { data: testProfile, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (testError) {
        if (testError.code === 'PGRST116') {
          console.log('⚠️  Nenhum perfil encontrado para ID teste (esperado)');
        } else {
          console.log('❌ Erro na consulta teste:', testError.message);
        }
      } else {
        console.log('✅ Perfil teste encontrado:', testProfile?.email);
      }
    } catch (err) {
      console.log('❌ Erro na consulta:', err.message);
    }

    // 4. Verificar se conseguimos fazer uma query mais genérica
    console.log('\n4. Verificando se há algum perfil na tabela:');
    const { data: anyProfile, error: anyError } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1)
      .maybeSingle();

    if (anyError) {
      console.log('❌ Erro ao buscar qualquer perfil:', anyError.message);
    } else if (anyProfile) {
      console.log('✅ Exemplo de perfil encontrado:', anyProfile.email);
      
      // Testar a query problemática com este ID real
      console.log('\n5. Testando getUserById com perfil real...');
      const { data: realProfile, error: realError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', anyProfile.id)
        .single();

      if (realError) {
        console.log('❌ Erro mesmo com ID real:', realError.message);
      } else {
        console.log('✅ Consulta com ID real funcionou:', realProfile.email);
      }
    } else {
      console.log('ℹ️  Nenhum perfil encontrado na tabela (tabela vazia)');
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

checkCurrentState().then(() => {
  console.log('\n✨ Verificação concluída!');
  process.exit(0);
}).catch(console.error);
