/**
 * Script para verificar e corrigir usuários sem perfil
 * Útil para corrigir dados existentes onde o trigger pode não ter funcionado
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY // Use service key se disponível
);

async function fixUsersWithoutProfile() {
  console.log('🔧 Verificando usuários sem perfil...\n');

  try {
    // 1. Buscar todos os usuários do auth
    console.log('📋 Buscando usuários do sistema auth...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('❌ Erro ao buscar usuários do auth:', authError.message);
      return;
    }

    console.log(`✅ Encontrados ${authUsers.users.length} usuários no auth`);

    // 2. Buscar perfis existentes
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email');

    if (profilesError) {
      console.log('❌ Erro ao buscar perfis:', profilesError.message);
      return;
    }

    console.log(`✅ Encontrados ${existingProfiles.length} perfis existentes`);

    // 3. Identificar usuários sem perfil
    const existingProfileIds = new Set(existingProfiles.map(p => p.id));
    const usersWithoutProfile = authUsers.users.filter(user => 
      !existingProfileIds.has(user.id)
    );

    console.log(`\n🔍 Usuários sem perfil: ${usersWithoutProfile.length}`);

    if (usersWithoutProfile.length === 0) {
      console.log('✅ Todos os usuários já possuem perfil!');
      return;
    }

    // 4. Criar perfis para usuários sem perfil
    for (const user of usersWithoutProfile) {
      console.log(`\n👤 Criando perfil para: ${user.email}`);

      try {
        // Criar perfil
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email.split('@')[0],
            is_active: true
          })
          .select()
          .single();

        if (createError) {
          console.log(`❌ Erro ao criar perfil para ${user.email}:`, createError.message);
          continue;
        }

        console.log(`✅ Perfil criado: ${newProfile.email}`);

        // Criar role padrão
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'user'
          });

        if (roleError && roleError.code !== '23505') { // Ignora duplicatas
          console.log(`⚠️  Aviso ao criar role para ${user.email}:`, roleError.message);
        } else {
          console.log(`✅ Role 'user' criado para ${user.email}`);
        }

      } catch (error) {
        console.log(`💥 Erro geral para usuário ${user.email}:`, error.message);
      }
    }

    // 5. Verificação final
    console.log('\n📊 Verificação final...');
    const { data: finalProfiles } = await supabase
      .from('profiles')
      .select('id, email');

    console.log(`✅ Total de perfis após correção: ${finalProfiles.length}`);
    console.log(`✅ Usuários no auth: ${authUsers.users.length}`);

    if (finalProfiles.length === authUsers.users.length) {
      console.log('🎉 Sucesso! Todos os usuários agora possuem perfil.');
    } else {
      console.log('⚠️  Ainda existem usuários sem perfil. Verifique os erros acima.');
    }

  } catch (error) {
    console.log('💥 Erro geral no script:', error.message);
  }
}

// Executar o script
fixUsersWithoutProfile().then(() => {
  console.log('\n✨ Script de correção concluído!');
  process.exit(0);
}).catch(console.error);
