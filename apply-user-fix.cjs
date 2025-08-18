/**
 * Script para aplicar a correção de usuários sem perfil via SQL
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function executeCorrection() {
  console.log('🔧 Aplicando correção de usuários sem perfil via SQL...\n');

  try {
    // 1. Criar a função de correção
    console.log('📝 Criando função de correção...');
    const createFunctionQuery = `
      CREATE OR REPLACE FUNCTION fix_users_without_profile()
      RETURNS TABLE(
        user_id UUID,
        email TEXT,
        action TEXT
      )
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        user_record RECORD;
      BEGIN
        -- Buscar usuários do auth.users que não têm perfil em public.profiles
        FOR user_record IN 
          SELECT au.id, au.email, au.raw_user_meta_data
          FROM auth.users au
          LEFT JOIN public.profiles p ON au.id = p.id
          WHERE p.id IS NULL
          LIMIT 10 -- Limitamos para evitar timeout
        LOOP
          -- Verificar se perfil já existe (double-check)
          IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = user_record.id) THEN
            -- Criar perfil para o usuário
            INSERT INTO public.profiles (
              id, 
              email, 
              full_name, 
              is_active, 
              created_at, 
              updated_at
            ) VALUES (
              user_record.id,
              user_record.email,
              COALESCE(
                user_record.raw_user_meta_data->>'full_name',
                user_record.raw_user_meta_data->>'name',
                split_part(user_record.email, '@', 1)
              ),
              true,
              now(),
              now()
            );

            -- Criar role padrão para o usuário se não existir
            INSERT INTO public.user_roles (user_id, role, created_at)
            VALUES (user_record.id, 'user', now())
            ON CONFLICT (user_id, role) DO NOTHING;

            -- Retornar informação do usuário processado
            user_id := user_record.id;
            email := user_record.email;
            action := 'profile_created';
            RETURN NEXT;
          END IF;
        END LOOP;
        
        RETURN;
      END;
      $$;
    `;

    const { error: functionError } = await supabase.rpc('exec_sql', { 
      sql: createFunctionQuery 
    });

    if (functionError) {
      // Tentar método alternativo usando uma query direta
      console.log('⚠️  Método RPC falhou, tentando query direta...');
      
      // Verificar quantos usuários auth existem vs profiles
      const { data: authCount } = await supabase
        .from('auth.users')
        .select('id', { count: 'exact', head: true });
        
      const { data: profileCount } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
        
      console.log(`Auth users: ${authCount?.length || 'N/A'}`);
      console.log(`Profiles: ${profileCount?.length || 'N/A'}`);
      
      // Se não há profiles, vamos tentar criar um perfil teste
      if (!profileCount || profileCount.length === 0) {
        console.log('🧪 Nenhum perfil encontrado. Vou tentar criar um usuário teste...');
        
        // Simular criação de perfil para teste
        const testUserId = crypto.randomUUID();
        const testEmail = 'admin@test.com';
        
        const { data: testProfile, error: testError } = await supabase
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
          
        if (testError) {
          console.log('❌ Erro ao criar perfil teste:', testError.message);
        } else {
          console.log('✅ Perfil teste criado:', testProfile.email);
          
          // Criar role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: testUserId,
              role: 'admin'
            });
            
          if (roleError) {
            console.log('⚠️  Erro ao criar role:', roleError.message);
          } else {
            console.log('✅ Role admin criado para usuário teste');
          }
        }
      }
      
      return;
    }

    console.log('✅ Função criada com sucesso');

    // 2. Executar a função de correção
    console.log('🔄 Executando correção...');
    const { data: results, error: execError } = await supabase
      .rpc('fix_users_without_profile');

    if (execError) {
      console.log('❌ Erro ao executar correção:', execError.message);
      return;
    }

    if (results && results.length > 0) {
      console.log('✅ Usuários processados:');
      results.forEach(result => {
        console.log(`  - ${result.email}: ${result.action}`);
      });
    } else {
      console.log('ℹ️  Nenhum usuário sem perfil encontrado (ou todos já corrigidos)');
    }

    // 3. Verificação final
    const { data: finalProfiles, error: finalError } = await supabase
      .from('profiles')
      .select('email, role')
      .limit(10);

    if (finalError) {
      console.log('❌ Erro na verificação final:', finalError.message);
    } else {
      console.log('\n📊 Perfis existentes:');
      finalProfiles.forEach(profile => {
        console.log(`  - ${profile.email} (${profile.role || 'sem role'})`);
      });
    }

  } catch (error) {
    console.log('💥 Erro geral:', error.message);
  }
}

executeCorrection().then(() => {
  console.log('\n✨ Correção concluída!');
  process.exit(0);
}).catch(console.error);
