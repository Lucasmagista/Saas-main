/**
 * Script de debug para verificar problemas na autenticação
 * Executa consultas para identificar possíveis duplicatas ou inconsistências
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debugAuth() {
  console.log('🔍 Iniciando debug de autenticação...\n');

  try {
    // 1. Verificar se há perfis duplicados
    console.log('1. Verificando perfis duplicados por email:');
    const { data: duplicateProfiles, error: dupError } = await supabase
      .from('profiles')
      .select('email, count(*)')
      .group('email')
      .having('count(*)', 'gt', 1);
    
    if (dupError) {
      console.log('❌ Erro ao verificar duplicatas:', dupError.message);
    } else if (duplicateProfiles && duplicateProfiles.length > 0) {
      console.log('⚠️  Perfis duplicados encontrados:', duplicateProfiles);
    } else {
      console.log('✅ Nenhum perfil duplicado encontrado');
    }

    // 2. Verificar perfis sem roles
    console.log('\n2. Verificando perfis sem roles:');
    const { data: profilesWithoutRoles, error: noRoleError } = await supabase
      .from('profiles')
      .select(`
        id, email, full_name
      `)
      .not('id', 'in', 
        supabase.from('user_roles').select('user_id')
      );
    
    if (noRoleError) {
      console.log('❌ Erro ao verificar perfis sem roles:', noRoleError.message);
    } else if (profilesWithoutRoles && profilesWithoutRoles.length > 0) {
      console.log('⚠️  Perfis sem roles:', profilesWithoutRoles.length);
      profilesWithoutRoles.forEach(p => {
        console.log(`   - ${p.email} (${p.id})`);
      });
    } else {
      console.log('✅ Todos os perfis têm roles associados');
    }

    // 3. Verificar roles órfãos
    console.log('\n3. Verificando roles órfãos (sem perfil correspondente):');
    const { data: orphanRoles, error: orphanError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .not('user_id', 'in', 
        supabase.from('profiles').select('id')
      );
    
    if (orphanError) {
      console.log('❌ Erro ao verificar roles órfãos:', orphanError.message);
    } else if (orphanRoles && orphanRoles.length > 0) {
      console.log('⚠️  Roles órfãos encontrados:', orphanRoles.length);
    } else {
      console.log('✅ Nenhum role órfão encontrado');
    }

    // 4. Verificar estrutura de uma consulta problemática
    console.log('\n4. Testando consulta problemática com JOIN:');
    try {
      const { data: joinTest, error: joinError } = await supabase
        .from('profiles')
        .select(`
          *,
          user_roles(role)
        `)
        .limit(1);
        
      if (joinError) {
        console.log('❌ Erro no JOIN:', joinError.message);
      } else {
        console.log('✅ JOIN funcionando. Exemplo de resultado:', joinTest[0]);
      }
    } catch (err) {
      console.log('❌ Erro na consulta JOIN:', err.message);
    }

    // 5. Verificar um usuário específico (se você souber o ID)
    console.log('\n5. Testando método corrigido:');
    const { data: allProfiles } = await supabase
      .from('profiles')
      .select('id, email')
      .limit(1);
    
    if (allProfiles && allProfiles.length > 0) {
      const testUserId = allProfiles[0].id;
      console.log(`Testando usuário: ${allProfiles[0].email} (${testUserId})`);
      
      // Método antigo (problemático)
      try {
        const { data: oldMethod, error: oldError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role)
          `)
          .eq('id', testUserId)
          .single();
          
        if (oldError) {
          console.log('❌ Método antigo falhou:', oldError.message);
        } else {
          console.log('✅ Método antigo funcionou:', oldMethod.email);
        }
      } catch (err) {
        console.log('❌ Método antigo com erro:', err.message);
      }
      
      // Método novo (corrigido)
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUserId)
          .single();
          
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', testUserId);
        
        console.log('✅ Método novo funcionou:');
        console.log('   - Perfil:', profile.email);
        console.log('   - Roles:', userRoles?.map(r => r.role) || ['nenhum']);
      } catch (err) {
        console.log('❌ Método novo com erro:', err.message);
      }
    }

  } catch (error) {
    console.log('💥 Erro geral no debug:', error.message);
  }
}

// Executa o debug
debugAuth().then(() => {
  console.log('\n✨ Debug concluído!');
  process.exit(0);
}).catch(console.error);
