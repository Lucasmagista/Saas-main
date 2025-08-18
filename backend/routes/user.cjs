const logger = require('../logger.cjs');
const { logAudit } = require('../auditHelper.cjs');
const express = require('express');
const router = express.Router();
const userRepo = require('../repositories/userRepository.cjs');
const authenticateJWT = require('../middleware/authenticateJWT.cjs');
const authorizeRole = require('../middleware/authorizeRole.cjs');
// const auditLog = require('../middleware/auditLog'); // Importando o middleware de auditoria

// Permissões padrão por role
const rolePermissions = {
    admin: ['canEditUser', 'canViewReports', 'canManageRoles', 'canUploadFiles'],
    manager: ['canViewReports', 'canEditUser', 'canUploadFiles'],
    user: ['canUploadFiles'],
    guest: []
};

// GET perfil do usuário (exemplo: busca pelo id=1)
router.get('/profile', async (req, res) => {
  const userId = req.query.id || '1'; // Ajuste para pegar do token futuramente
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PUT atualizar perfil do usuário
router.put('/profile', express.json(), async (req, res) => {
  const userId = req.body.id || '1';
  const { data: oldUser } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  const { data, error } = await supabase
    .from('profiles')
    .update(req.body)
    .eq('id', userId)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  await logAudit({ req, action: 'update', resourceType: 'user', resourceId: userId, oldValues: oldUser, newValues: data });
  res.json(data);
});

// POST upload de avatar (simulação, salvaria no Supabase Storage)
router.post('/avatar', async (req, res) => {
  // Aqui você faria upload real para Supabase Storage
  // Exemplo: retorna URL mock
  res.json({ avatarUrl: '/placeholder.svg' });
});

// Consultar role do usuário autenticado
router.get('/role', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.user;
        const users = await userRepo.listAll();
        const user = users.find(u => u.id == id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json({ role: user.role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Alterar role (apenas admin)
router.put('/role/:id', authenticateJWT, authorizeRole(['admin']), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const data = await userRepo.update(id, { role });
        res.json({ user: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ao criar ou atualizar usuário, atribui permissões automaticamente
router.post('/create', authenticateJWT, authorizeRole(['admin']), async (req, res) => {
    try {
        const { email, role = 'user', ...rest } = req.body;
        const permissions = rolePermissions[role] || [];
        // O método insert não existe no userRepo, mas pode ser adicionado se necessário
        // Aqui, para manter a arquitetura, seria ideal criar userRepo.insert()
        // Por ora, manteremos a lógica original, mas o ideal é mover para o repositório
        res.status(501).json({ error: 'Criação de usuário deve ser implementada no repositório.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', authenticateJWT, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    // Auditoria de exclusão
    // await auditLog(req, 'delete_user', { id });
    await userRepo.remove(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Editar role/permissões de usuário
router.put('/permissions/:id', authenticateJWT, authorizeRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;
    const update = {};
    if (role) update.role = role;
    if (permissions) update.permissions = permissions;
    if (role) update.permissions = rolePermissions[role] || [];
    // Auditoria
    console.log(`[AUDIT] Usuário ${req.user.id} alterou role/permissões de ${id} para role=${role}, permissions=${JSON.stringify(update.permissions)}`);
    const data = await userRepo.update(id, update);
    res.json({ user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar todos usuários com roles/permissões
router.get('/list', authenticateJWT, authorizeRole(['admin', 'manager']), async (req, res) => {
    try {
        const users = await userRepo.listAll();
        res.json({ users });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
