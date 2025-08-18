const jwtService = require('../services/jwtService.cjs');

module.exports = function authenticateJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({
            success: false,
            error: 'Token de autorização não fornecido',
            code: 'NO_TOKEN'
        });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Formato do token inválido. Use: Bearer <token>',
            code: 'INVALID_FORMAT'
        });
    }

    try {
        const decoded = jwtService.verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.message.includes('expired')) {
            return res.status(401).json({
                success: false,
                error: 'Token expirado. Use o refresh token para renovar.',
                code: 'TOKEN_EXPIRED'
            });
        }
        
        return res.status(403).json({
            success: false,
            error: 'Token inválido',
            code: 'INVALID_TOKEN'
        });
    }
};
