"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Configuración de autenticación
 * Define parámetros relacionados con JWT y autenticación
 */
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno
dotenv_1.default.config();
/**
 * Configuración de autenticación
 * - secret: Clave secreta para firmar tokens JWT
 * - expiresIn: Tiempo de expiración de los tokens JWT
 */
exports.default = {
    // ✅ CORREGIDO: Asegurar que secret sea un string
    secret: process.env.JWT_SECRET || 'tatoodenda-secret-key',
    // Tiempo de expiración del token
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
};
//# sourceMappingURL=auth.js.map