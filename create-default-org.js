import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qwddtvotgdzcswcvuqpw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3ZGR0dm90Z2R6Y3N3Y3Z1cXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwODY2NzEsImV4cCI6MjA2ODY2MjY3MX0.F1mpVO4qDUFSo2Y7XjWT09vGNKm1JYH_ruOOPVBAwiU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createDefaultOrganization() {
  try {
    console.log('Verificando se existe organização...');
    
    // Verificar se já existe uma organização
    const { data: existingOrg, error: checkError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(1)
      .single();
    
    if (existingOrg) {
      console.log('Organização já existe:', existingOrg);
      return existingOrg;
    }
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = não encontrado
      console.error('Erro ao verificar organização:', checkError);
      return null;
    }
    
    console.log('Criando organização padrão...');
    
    // Criar organização padrão
    const { data: newOrg, error: createError } = await supabase
      .from('organizations')
      .insert({
        name: 'Organização Padrão',
        domain: 'default.local',
        settings: {}
      })
      .select('id, name')
      .single();
    
    if (createError) {
      console.error('Erro ao criar organização:', createError);
      return null;
    }
    
    console.log('Organização criada com sucesso:', newOrg);
    return newOrg;
    
  } catch (error) {
    console.error('Erro geral:', error);
    return null;
  }
}

createDefaultOrganization().then(() => {
  console.log('Script finalizado');
  process.exit(0);
});
