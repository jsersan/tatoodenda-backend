"use strict";
/**
 * Rutas de Usuario - CORREGIDO
 * Define endpoints para gestión de usuarios y autenticación
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = __importDefault(require("../controllers/user.controller")); // ✅ Import correcto
const auth_middleware_1 = require("../middleware/auth.middleware");
// Crear un router para las rutas de usuario
const router = (0, express_1.Router)();
// ============================================
// RUTAS PÚBLICAS (no requieren autenticación)
// ============================================
/**
 * POST /api/users/register
 * Registra un nuevo usuario
 */
router.post('/register', user_controller_1.default.register);
/**
 * POST /api/users/login
 * Inicia sesión para un usuario existente
 */
router.post('/login', user_controller_1.default.login);
// ============================================
// 🆕 RUTAS DE RECUPERACIÓN DE CONTRASEÑA
// ============================================
/**
 * POST /api/users/forgot-password
 * Solicitar recuperación de contraseña
 * Body: { email: string }
 */
router.post('/forgot-password', user_controller_1.default.forgotPassword);
/**
 * POST /api/users/reset-password
 * Restablecer contraseña con token
 * Body: { token: string, newPassword: string }
 */
router.post('/reset-password', user_controller_1.default.resetPassword);
/**
 * GET /api/users/verify-reset-token/:token
 * Verificar si un token es válido (opcional)
 * Params: token
 * Response: { valid: boolean, message: string }
 */
router.get('/verify-reset-token/:token', user_controller_1.default.verifyResetToken);
// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================
/**
 * GET /api/users/profile
 * Obtiene el perfil del usuario autenticado
 * Header: Authorization: Bearer <token>
 */
router.get('/profile', auth_middleware_1.verifyToken, user_controller_1.default.profile);
/**
 * PUT /api/users/:id
 * Actualiza los datos de un usuario específico
 * Header: Authorization: Bearer <token>
 * Params: id (user ID)
 * Body: { username?: string, email?: string }
 */
router.put('/:id', auth_middleware_1.verifyToken, user_controller_1.default.update);
exports.default = router;
//# sourceMappingURL=user.routes.js.map