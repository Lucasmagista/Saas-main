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
    // 1. Verificar quantos perfis existem
    console.log('1. Contando perfis:');
    const { data: allProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name');
    
    if (profilesError) {
      console.log('❌ Erro ao buscar perfis:', profilesError.message);
      return;
    }
    
    console.log(`✅ Total de perfis: ${allProfiles?.length || 0}`);

    // 2. Verificar user_roles
    console.log('\n2. Contando user_roles:');
    const { data: allRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');
    
    if (rolesError) {
      console.log('❌ Erro ao buscar roles:', rolesError.message);
    } else {
      console.log(`✅ Total de roles: ${allRoles?.length || 0}`);
    }

    // 3. Testar um usuário específico se existir
    if (allProfiles && allProfiles.length > 0) {
      const testUser = allProfiles[0];
      console.log(`\n3. Testando usuário: ${testUser.email}`);
      
      // Método problemático original
      try {
        const { data: problemData, error: problemError } = await supabase
          .from('profiles')
          .select(`
            *,
            user_roles(role)
          `)
          .eq('id', testUser.id)
          .single();
          
        if (problemError) {
          console.log('❌ Método com JOIN falhou:', problemError.message);
        } else {
          console.log('✅ Método com JOIN funcionou');
        }
      } catch (err) {
        console.log('❌ Método com JOIN erro:', err.message);
      }
      
      // Método corrigido
      try {
        const { data: profile, error: profError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', testUser.id)
          .single();
          
        const { data: roles, error: rolesErr } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', testUser.id);
        
        if (profError) {
          console.log('❌ Erro no perfil:', profError.message);
        } else if (rolesErr) {
          console.log('⚠️  Perfil ok, erro nos roles:', rolesErr.message);
        } else {
          console.log('✅ Método corrigido funcionou');
          console.log(`   - Email: ${profile.email}`);
          console.log(`   - Roles: ${roles?.map(r => r.role).join(', ') || 'nenhum'}`);
        }
      } catch (err) {
        console.log('❌ Método corrigido erro:', err.message);
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
