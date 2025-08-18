/**
 * Script simples para criar um usuário de teste diretamente na tabela profiles
 * e testar o endpoint de autenticação
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function createTestUser() {
  console.log('🧪 Criando usuário de teste para validar autenticação...\n');

  const testUserId = 'b5c4a2e1-1234-5678-9abc-def012345678'; // UUID fictício para teste
  const testEmail = 'admin@test.com';

  try {
    // 1. Verificar se já existe
    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (existing) {
      console.log('✅ Usuário de teste já existe:', existing.email);
      console.log('ID:', existing.id);
      return existing;
    }

    // 2. Criar perfil diretamente
    console.log('📝 Criando perfil de teste...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: testUserId,
        email: testEmail,
        full_name: 'Admin Teste',
        position: 'Administrador',
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.log('❌ Erro ao criar perfil:', profileError.message);
      return null;
    }

    console.log('✅ Perfil criado:', profile.email);

    // 3. Criar role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: testUserId,
        role: 'admin'
      });

    if (roleError && roleError.code !== '23505') {
      console.log('⚠️  Erro ao criar role:', roleError.message);
    } else {
      console.log('✅ Role admin criado');
    }

    // 4. Testar a função getUserById
    console.log('\n🔧 Testando função getUserById...');
    
    // Simular o que acontece no authRepository
    try {
      let { data: testProfile, error: testError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', testUserId)
        .single();

      if (testError) {
        console.log('❌ Erro ao buscar perfil:', testError.message);
      } else {
        console.log('✅ Perfil encontrado via single():', testProfile.email);

        // Buscar roles
        const { data: roles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', testUserId);

        console.log('✅ Roles encontrados:', roles?.map(r => r.role) || []);
      }
    } catch (err) {
      console.log('❌ Erro no teste:', err.message);
    }

    return profile;

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
    return null;
  }
}

async function testAuthEndpoint(userId) {
  console.log('\n🌐 Testando endpoint /api/auth/me...');
  
  try {
    // Simular o que o JWT teria (sem realmente criar um JWT válido)
    const response = await fetch('http://localhost:3002/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer fake-token-for-test`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Resposta:', data);
    } else {
      const errorData = await response.text();
      console.log('❌ Erro:', errorData);
    }
  } catch (error) {
    console.log('❌ Erro na requisição:', error.message);
  }
}

// Executar testes
createTestUser().then((user) => {
  if (user) {
    console.log('\n🎯 Usuário de teste criado com sucesso!');
    console.log('📋 Detalhes:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Nome: ${user.full_name}`);
    
    // Note: O teste do endpoint requer um JWT válido, então não vamos testá-lo aqui
    console.log('\n💡 Para testar completamente:');
    console.log('1. Use o frontend para fazer login com um usuário real');
    console.log('2. O sistema agora deve criar automaticamente o perfil se não existir');
    console.log('3. Verifique os logs do servidor para confirmar');
  }
  
  console.log('\n✨ Teste concluído!');
  process.exit(0);
}).catch(console.error);
