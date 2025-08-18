/**
 * Script para criar um usuário admin de teste e verificar o processo
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createTestAdmin() {
  console.log('🧪 Criando usuário admin de teste...\n');

  const testEmail = 'admin@test.com';
  const testPassword = 'admin123456';

  try {
    // 1. Verificar se o usuário já existe
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();
      
    if (existingProfile) {
      console.log('✅ Usuário admin já existe:', existingProfile.email);
      return existingProfile;
    }

    // 2. Criar usuário via Supabase Auth
    console.log('📝 Criando usuário via Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Confirma email automaticamente
    });

    if (authError) {
      console.log('❌ Erro ao criar usuário:', authError.message);
      return null;
    }

    console.log('✅ Usuário criado via Auth:', authData.user.email);

    // 3. Aguardar um pouco para o trigger executar
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Verificar se o perfil foi criado pelo trigger
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.log('❌ Perfil não foi criado automaticamente:', profileError.message);
      
      // 5. Criar perfil manualmente
      console.log('🔧 Criando perfil manualmente...');
      const { data: manualProfile, error: manualError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: 'Admin Teste',
          position: 'Administrador',
          is_active: true
        })
        .select()
        .single();
        
      if (manualError) {
        console.log('❌ Erro ao criar perfil manual:', manualError.message);
        return null;
      }
      
      console.log('✅ Perfil criado manualmente');
      newProfile.data = manualProfile;
    } else {
      console.log('✅ Perfil criado automaticamente pelo trigger');
    }

    // 6. Criar role de admin
    console.log('👑 Criando role de admin...');
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        role: 'admin'
      })
      .select()
      .single();

    if (roleError) {
      console.log('❌ Erro ao criar role:', roleError.message);
    } else {
      console.log('✅ Role admin criado');
    }

    // 7. Verificar resultado final
    const { data: finalProfile, error: finalError } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role)
      `)
      .eq('id', authData.user.id);

    if (finalError) {
      console.log('❌ Erro ao verificar perfil final:', finalError.message);
    } else {
      console.log('✅ Perfil final criado com sucesso:');
      console.log('   - Email:', finalProfile[0]?.email);
      console.log('   - Roles:', finalProfile[0]?.user_roles?.map(r => r.role));
    }

    console.log('\n🎉 Usuário admin de teste criado!');
    console.log(`📧 Email: ${testEmail}`);
    console.log(`🔒 Senha: ${testPassword}`);
    console.log('🔗 Use essas credenciais para testar o login');

    return finalProfile[0];

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
    return null;
  }
}

// Executar
createTestAdmin().then(() => {
  console.log('\n✨ Script concluído!');
  process.exit(0);
}).catch(console.error);
