// Roles padrão: admin, manager, user, guest
const ROLES = ['admin', 'manager', 'user', 'guest'];

module.exports = function authorizeRole(roles = []) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Usuário não autenticado ou sem role definida.' });
        }
        // Permite acesso se o role do usuário está na lista de roles permitidos
        if (roles.length === 0 || roles.includes(req.user.role)) {
            return next();
        }
        return res.status(403).json({ error: `Acesso negado: role '${req.user.role}' não possui permissão para esta ação.` });
    };
};

// Exemplo de uso:
// app.use('/api/admin', authenticateJWT, authorizeRole(['admin']));
// app.use('/api/manager', authenticateJWT, authorizeRole(['admin', 'manager']));
// app.use('/api/user', authenticateJWT, authorizeRole(['admin', 'manager', 'user']));
