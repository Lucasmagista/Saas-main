// Repositório para autenticação usando Supabase
const supabase = require('../supabaseClient.cjs');
const jwtService = require('../services/jwtService.cjs');

async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  
  // Busca dados completos do usuário incluindo role e permissões
  const userProfile = await getUserById(data.user.id);
  
  // Gera tokens customizados com dados atualizados
  const tokens = jwtService.generateTokens({
    id: data.user.id,
    email: data.user.email,
    role: userProfile.role || 'user',
    position: userProfile.position || userProfile.role || 'user',
    full_name: userProfile.full_name,
    all_roles: userProfile.all_roles
  });
  
  return {
    user: {
      ...data.user,
      role: userProfile.role,
      position: userProfile.position,
      full_name: userProfile.full_name,
      all_roles: userProfile.all_roles
    },
    session: data.session,
    ...tokens
  };
}

async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  
  // Se o usuário foi criado com sucesso, gera tokens
  if (data.user && !data.user.email_confirmed_at) {
    return {
      user: data.user,
      session: data.session,
      message: 'Verifique seu email para confirmar a conta'
    };
  }
  
  // Se confirmado automaticamente, gera tokens
  if (data.user && data.user.email_confirmed_at) {
    const tokens = jwtService.generateTokens({
      id: data.user.id,
      email: data.user.email,
      role: data.user.role || 'user'
    });
    
    return {
      user: data.user,
      session: data.session,
      ...tokens
    };
  }
  
  return data;
}

async function getUserById(id) {
  try {
    // Busca o perfil do usuário
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
      
    // Se o perfil não existe, cria automaticamente com dados mínimos
    if (profileError && profileError.code === 'PGRST116') { // No rows returned
      console.log('Perfil não encontrado, criando automaticamente para usuário:', id);
      
      // Tenta buscar informações do usuário do auth.users primeiro
      let userEmail = `user-${id.slice(0, 8)}@placeholder.com`;
      let userName = 'Usuário';
      
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(id);
        if (!authError && authUser.user) {
          userEmail = authUser.user.email || userEmail;
          userName = authUser.user.user_metadata?.full_name || 
                   authUser.user.user_metadata?.name || 
                   authUser.user.email?.split('@')[0] || 
                   userName;
        }
      } catch (authErr) {
        console.warn('Não foi possível buscar dados do auth.users, usando dados padrão');
      }
      
      // Cria perfil com bypass temporário do RLS usando service role
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: id,
          email: userEmail,
          full_name: userName,
          position: 'user',
          is_active: true
        })
        .select()
        .single();
        
      if (createError) {
        // Se falha a criação, pode ser problema de RLS ou permissões
        console.error('Erro detalhado ao criar perfil:', {
          code: createError.code,
          message: createError.message,
          details: createError.details,
          hint: createError.hint
        });
        
        // Retorna erro mais específico baseado no código
        if (createError.code === '42501') {
          throw new Error(`Erro de permissão ao criar perfil. Verifique as políticas RLS da tabela profiles.`);
        } else if (createError.code === '23505') {
          // Erro de chave duplicada - perfil já existe, tenta buscar novamente
          const { data: existingProfile, error: refetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
            
          if (!refetchError && existingProfile) {
            profile = existingProfile;
            console.log('Perfil já existia, utilizando perfil encontrado');
          } else {
            throw new Error(`Perfil não encontrado após tentativa de criação.`);
          }
        } else {
          throw new Error(`Perfil não encontrado e não foi possível criar automaticamente: ${createError.message}`);
        }
      } else {
        profile = newProfile;
        console.log('Perfil criado com sucesso:', { id: profile.id, email: profile.email });
      }
      
      // Cria role padrão se não existir
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: id,
          role: 'user'
        });
        
      if (roleError && roleError.code !== '23505') { // Ignora erro de duplicata
        console.warn('Erro ao criar role padrão:', roleError.message);
      }
    } else if (profileError) {
      throw new Error(`Erro ao buscar perfil: ${profileError.message}`);
    }
    
    // Busca os roles do usuário separadamente
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', id);
    
    // Se não conseguir buscar roles, não é erro fatal - continua com role padrão
    if (rolesError) {
      console.warn('Erro ao buscar roles do usuário:', rolesError.message);
    }
    
    // Prioriza o 'position' do perfil, depois os roles da tabela user_roles
    let finalRole = 'user';
    
    // Se tem position no perfil, usa ele
    if (profile.position && profile.position !== 'user') {
      finalRole = profile.position;
    }
    // Se não tem position mas tem roles, usa o role de maior prioridade
    else if (userRoles && userRoles.length > 0) {
      const rolesPriority = { admin: 3, manager: 2, user: 1 };
      const sortedRoles = userRoles
        .map(ur => ur.role)
        .sort((a, b) => (rolesPriority[b] || 0) - (rolesPriority[a] || 0));
      
      finalRole = sortedRoles[0];
    }
    
      profile.role = finalRole;
      profile.all_roles = userRoles ? userRoles.map(ur => ur.role) : ['user'];
      // Se o role for admin, garanta que o position também seja admin
      if (finalRole === 'admin' && (!profile.position || profile.position === 'user')) {
        profile.position = 'admin';
      }
      console.log(`Usuário ${profile.email}: position=${profile.position}, final_role=${profile.role}`);
      return profile;
  } catch (error) {
    console.error('Erro em getUserById:', error);
    throw error;
  }
}

async function refreshTokens(refreshToken) {
  return await jwtService.refreshTokens(refreshToken, getUserById);
}

async function logout(refreshToken) {
  if (refreshToken) {
    jwtService.revokeRefreshToken(refreshToken);
  }
  return { success: true, message: 'Logout realizado com sucesso' };
}

async function logoutAllDevices(userId) {
  const revokedCount = jwtService.revokeAllUserTokens(userId);
  return { 
    success: true, 
    message: `Logout realizado em ${revokedCount} dispositivo(s)` 
  };
}

module.exports = {
  signInWithPassword,
  signUp,
  getUserById,
  refreshTokens,
  logout,
  logoutAllDevices,
};
