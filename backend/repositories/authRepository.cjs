// Repositório para autenticação usando PostgreSQL local
const jwtService = require('../services/jwtService.cjs');

async function signInWithPassword(email, password) {
  // Implementar autenticação com PostgreSQL local
const data = await postgresClient.query('SELECT * FROM users WHERE email = $1', [email]);
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
  // Implementar registro com PostgreSQL local
const data = await postgresClient.query('INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *', [email, password]);
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
    let result = await db.query('SELECT * FROM profiles WHERE id = $1', [id]);
    let profile = result.rows[0];
    // Se o perfil não existe, cria automaticamente com dados mínimos
    if (!profile) {
      console.log('Perfil não encontrado, criando automaticamente para usuário:', id);
      // Busca email do usuário
      let userResult = await db.query('SELECT email FROM users WHERE id = $1', [id]);
      let userEmail = userResult.rows[0]?.email || `user-${id.slice(0, 8)}@placeholder.com`;
      let userName = 'Usuário';
      // Cria perfil
      let insertProfile = await db.query(
        'INSERT INTO profiles (id, email, full_name, position, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [id, userEmail, userName, 'user', true]
      );
      profile = insertProfile.rows[0];
      console.log('Perfil criado com sucesso:', { id: profile.id, email: profile.email });
      // Cria role padrão se não existir
      try {
        await db.query('INSERT INTO user_roles (user_id, role) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, 'user']);
      } catch (roleError) {
        console.warn('Erro ao criar role padrão:', roleError.message);
      }
    }
    // Busca os roles do usuário separadamente
    let userRolesResult = await db.query('SELECT role FROM user_roles WHERE user_id = $1', [id]);
    let userRoles = userRolesResult.rows;
    // Prioriza o 'position' do perfil, depois os roles da tabela user_roles
    let finalRole = 'user';
    if (profile.position && profile.position !== 'user') {
      finalRole = profile.position;
    } else if (userRoles && userRoles.length > 0) {
      const rolesPriority = { admin: 3, manager: 2, user: 1 };
      const sortedRoles = userRoles
        .map(ur => ur.role)
        .sort((a, b) => (rolesPriority[b] || 0) - (rolesPriority[a] || 0));
      finalRole = sortedRoles[0];
    }
    profile.role = finalRole;
    profile.all_roles = userRoles ? userRoles.map(ur => ur.role) : ['user'];
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
