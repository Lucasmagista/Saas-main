// Script para debug do problema de autenticação
// Execute com: node debug-admin-auth.cjs

// Carregar variáveis de ambiente se existir arquivo .env
const fs = require('fs');
const path = require('path');

// Tentar carregar .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    require('dotenv').config();
}

async function debugAuth() {
    const email = 'lucas.magista1@gmail.com';
    
    console.log('🔍 DEBUG - Verificando configuração da autenticação...\n');
    
    try {
        // Verificar variáveis de ambiente
        console.log('1. Verificando configuração:');
        console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
        console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Definida' : '❌ Não definida');
        console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Definida' : '❌ Não definida');
        
        if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
            console.log('\n❌ PROBLEMA: Variáveis do Supabase não configuradas!');
            console.log('Execute os seguintes comandos:');
            console.log('1. Execute o SQL no Supabase Dashboard: fix_admin_persistence.sql');
            console.log('2. Configure as variáveis no arquivo .env');
            console.log('3. Reinicie o servidor backend');
            return;
        }

        // Agora tentar carregar o supabase
        const supabase = require('./backend/supabaseClient.cjs');
        const authRepo = require('./backend/repositories/authRepository.cjs');
        const jwtService = require('./backend/services/jwtService.cjs');
        
        // 2. Verificar perfil diretamente no banco
        console.log('\n2. Verificando perfil no banco:');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single();
            
        if (profileError) {
            console.error('❌ Erro ao buscar perfil:', profileError.message);
            console.log('\n🔧 SOLUÇÃO: Execute o SQL fix_admin_persistence.sql no Supabase Dashboard');
            return;
        }
        
        console.log('✅ Perfil encontrado:', {
            id: profile.id,
            email: profile.email,
            position: profile.position,
            full_name: profile.full_name,
            is_active: profile.is_active
        });
        
        // 3. Verificar roles na tabela user_roles
        console.log('\n3. Verificando roles do usuário:');
        const { data: roles, error: rolesError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', profile.id);
            
        if (rolesError) {
            console.warn('⚠️ Erro ao buscar roles:', rolesError.message);
        } else {
            console.log('✅ Roles encontrados:', roles);
        }
        
        // 4. Usar o getUserById para verificar como está processando
        console.log('\n4. Testando getUserById:');
        const userProfile = await authRepo.getUserById(profile.id);
        console.log('✅ Resultado do getUserById:', {
            id: userProfile.id,
            email: userProfile.email,
            role: userProfile.role,
            position: userProfile.position,
            all_roles: userProfile.all_roles
        });
        
        if (userProfile.role !== 'admin' && userProfile.position !== 'admin') {
            console.log('\n❌ PROBLEMA: Usuário não tem role/position admin!');
            console.log('🔧 SOLUÇÃO: Execute o SQL fix_admin_persistence.sql no Supabase Dashboard');
            return;
        }
        
        // 5. Testar geração de token
        console.log('\n5. Testando geração de token:');
        const tokenPayload = {
            id: profile.id,
            email: profile.email,
            role: userProfile.role,
            position: userProfile.position,
            full_name: userProfile.full_name,
            all_roles: userProfile.all_roles
        };
        
        const tokens = jwtService.generateTokens(tokenPayload);
        console.log('✅ Token gerado com payload:', tokenPayload);
        
        // 6. Verificar token decodificado
        console.log('\n6. Verificando token decodificado:');
        const decoded = jwtService.verifyAccessToken(tokens.accessToken);
        console.log('✅ Token decodificado:', {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            position: decoded.position,
            exp: new Date(decoded.exp * 1000).toLocaleString()
        });
        
        console.log('\n✅ DEBUG CONCLUÍDO - Autenticação está funcionando corretamente');
        console.log('📋 PRÓXIMOS PASSOS:');
        console.log('1. Limpe o localStorage do navegador');
        console.log('2. Faça logout e login novamente');
        console.log('3. Verifique se o token contém role admin');
        
    } catch (error) {
        console.error('❌ Erro durante debug:', error.message);
        console.log('\n🔧 POSSÍVEIS SOLUÇÕES:');
        console.log('1. Execute o SQL fix_admin_persistence.sql no Supabase Dashboard');
        console.log('2. Configure as variáveis de ambiente no .env');
        console.log('3. Reinicie o servidor backend');
        console.log('4. Limpe o cache do navegador e localStorage');
    }
}

// Executar debug
debugAuth().then(() => {
    console.log('\n🔍 Debug finalizado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});
