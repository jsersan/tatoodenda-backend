"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.optionalAuthMiddleware = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = __importDefault(require("../config/auth"));
const verifyToken = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ message: 'Token no proporcionado' });
            return;
        }
        // Extraer el token (formato: "Bearer TOKEN")
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'Token mal formateado' });
            return;
        }
        // Verificar el token
        const decoded = jsonwebtoken_1.default.verify(token, auth_1.default.secret);
        // Añadir el ID del usuario al request
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        console.error('Error en middleware de autenticación:', error);
        res.status(401).json({ message: 'Token inválido' });
    }
};
exports.verifyToken = verifyToken;
// Middleware opcional para rutas que pueden requerir autenticación
const optionalAuthMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next();
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            next();
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, auth_1.default.secret);
        req.userId = decoded.id;
        next();
    }
    catch (error) {
        // En caso de error, simplemente continuar sin establecer userId
        next();
    }
};
exports.optionalAuthMiddleware = optionalAuthMiddleware;
// Alias para compatibilidad
exports.authMiddleware = exports.verifyToken;
//# sourceMappingURL=auth.middleware.js.map