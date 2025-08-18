// Middleware para permissões customizadas por ação
module.exports = function authorizePermission(requiredPermissions = []) {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(401).json({ error: 'Usuário não autenticado ou sem permissões definidas.' });
        }
        // Permite se o usuário possui todas as permissões necessárias
        const hasAll = requiredPermissions.every(p => req.user.permissions.includes(p));
        if (hasAll) {
            return next();
        }
        return res.status(403).json({ error: `Acesso negado: permissões insuficientes (${requiredPermissions.join(', ')})` });
    };
};

// Exemplo de uso:
// app.use('/api/reports', authenticateJWT, authorizePermission(['canViewReports']));
// app.use('/api/users/edit', authenticateJWT, authorizePermission(['canEditUser']));
