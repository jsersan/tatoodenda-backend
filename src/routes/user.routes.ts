/**
 * Rutas de Usuario - CORREGIDO
 * Define endpoints para gestión de usuarios y autenticación
 */

import { Router } from 'express';
import userController from '../controllers/user.controller'; // ✅ Import correcto
import { verifyToken } from '../middleware/auth.middleware';

// Crear un router para las rutas de usuario
const router = Router();

// ============================================
// RUTAS PÚBLICAS (no requieren autenticación)
// ============================================

/**
 * POST /api/users/register
 * Registra un nuevo usuario
 */
router.post('/register', userController.register);

/**
 * POST /api/users/login
 * Inicia sesión para un usuario existente
 */
router.post('/login', userController.login);

// ============================================
// 🆕 RUTAS DE RECUPERACIÓN DE CONTRASEÑA
// ============================================

/**
 * POST /api/users/forgot-password
 * Solicitar recuperación de contraseña
 * Body: { email: string }
 */
router.post('/forgot-password', userController.forgotPassword);

/**
 * POST /api/users/reset-password
 * Restablecer contraseña con token
 * Body: { token: string, newPassword: string }
 */
router.post('/reset-password', userController.resetPassword);

/**
 * GET /api/users/verify-reset-token/:token
 * Verificar si un token es válido (opcional)
 * Params: token
 * Response: { valid: boolean, message: string }
 */
router.get('/verify-reset-token/:token', userController.verifyResetToken);

// ============================================
// RUTAS PROTEGIDAS (requieren autenticación)
// ============================================

/**
 * GET /api/users/profile
 * Obtiene el perfil del usuario autenticado
 * Header: Authorization: Bearer <token>
 */
router.get('/profile', verifyToken, userController.profile);

/**
 * PUT /api/users/:id
 * Actualiza los datos de un usuario específico
 * Header: Authorization: Bearer <token>
 * Params: id (user ID)
 * Body: { username?: string, email?: string }
 */
router.put('/:id', verifyToken, userController.update);

export default router;