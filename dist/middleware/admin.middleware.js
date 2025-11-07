"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = void 0;
const models_1 = __importDefault(require("../models"));
// Referencia al modelo User
const User = models_1.default.User;
/**
 * Middleware para verificar permisos de administrador
 * Debe utilizarse después del middleware verifyToken
 */
const isAdmin = async (req, res, next) => {
    try {
        // Verificar que el usuario esté autenticado
        if (!req.userId) {
            return res.status(401).json({ message: 'Usuario no autenticado' });
        }
        // Buscar el usuario en la base de datos
        const user = await User.findByPk(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        // Verificar si el usuario es administrador
        // Consideramos admin tanto al usuario con nombre 'admin' como al que tiene rol 'admin'
        if (user.get('username') === 'admin' || user.get('role') === 'admin') {
            // Usuario es admin, continuar
            next();
            return;
        }
        // Usuario no es admin, denegar acceso
        res.status(403).json({
            message: 'Acceso denegado',
            details: 'Se requieren permisos de administrador para esta operación'
        });
    }
    catch (err) {
        console.error('Error al verificar permisos de administrador:', err);
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: 'Error desconocido' });
        }
    }
};
exports.isAdmin = isAdmin;
//# sourceMappingURL=admin.middleware.js.map