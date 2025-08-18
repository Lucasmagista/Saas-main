// Teste de conexão com Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qwddtvotgdzcswcvuqpw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZGR0dm90Z2R6Y3N3Y3Z1cXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODY2NzEsImV4cCI6MjA2ODY2MjY3MX0.F1mpVO4qDUFSo2Y7XjWT09vGNKm1JYH_ruOOPVBAwiU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔄 Testando conexão com Supabase...');
    
    // Teste 1: Verificar se a API está respondendo
    const { error: healthError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('❌ Erro na conexão:', healthError.message);
      return;
    }
    
    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    
    // Teste 2: Verificar tabelas existentes
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names');
    
    if (!tablesError && tables) {
      console.log('📋 Tabelas encontradas:', tables.length);
    }
    
    // Teste 3: Verificar se as tabelas de permissões existem
    const permissionsTest = await supabase
      .from('permissions')
      .select('count')
      .limit(1);
    
    const rolesTest = await supabase
      .from('roles')
      .select('count')
      .limit(1);
    
    const rolePermissionsTest = await supabase
      .from('role_permissions')
      .select('count')
      .limit(1);
    
    if (permissionsTest.error) {
      console.log('❌ Tabela "permissions" não existe:', permissionsTest.error.message);
    } else {
      console.log('✅ Tabela "permissions" existe e está acessível');
    }
    
    if (rolesTest.error) {
      console.log('❌ Tabela "roles" não existe:', rolesTest.error.message);
    } else {
      console.log('✅ Tabela "roles" existe e está acessível');
    }
    
    if (rolePermissionsTest.error) {
      console.log('❌ Tabela "role_permissions" não existe:', rolePermissionsTest.error.message);
    } else {
      console.log('✅ Tabela "role_permissions" existe e está acessível');
    }
    
    // Teste 4: Verificar tabelas existentes que podemos usar
    const existingTables = await Promise.all([
      supabase.from('profiles').select('count').limit(1),
      supabase.from('user_roles').select('count').limit(1),
      supabase.from('bots').select('count').limit(1),
      supabase.from('multisessions').select('count').limit(1),
    ]);
    
    console.log('\n📊 Status das tabelas existentes:');
    if (!existingTables[0].error) console.log('✅ profiles - OK');
    if (!existingTables[1].error) console.log('✅ user_roles - OK');
    if (!existingTables[2].error) console.log('✅ bots - OK');
    if (!existingTables[3].error) console.log('✅ multisessions - OK');
    
  } catch (error) {
    console.log('💥 Erro inesperado:', error);
  }
}

testConnection();
