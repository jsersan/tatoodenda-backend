"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.createError = exports.errorHandler = void 0;
const sequelize_1 = require("sequelize");
/**
 * Middleware para manejar errores de la aplicación
 * Procesa diferentes tipos de errores y devuelve respuestas consistentes
 *
 * @param err Error capturado
 * @param req Objeto Request de Express
 * @param res Objeto Response de Express
 * @param next Función NextFunction de Express
 */
const errorHandler = (err, req, res, next) => {
    var _a;
    console.error('Error capturado por el manejador global:', err);
    // Errores de Sequelize (validación, etc.)
    if (err instanceof sequelize_1.ValidationError) {
        res.status(400).json({
            message: 'Error de validación',
            errors: (_a = err.errors) === null || _a === void 0 ? void 0 : _a.map(e => ({
                field: e.path,
                message: e.message
            }))
        });
        return;
    }
    // Errores personalizados con código de estado definido
    if ('statusCode' in err && err.statusCode) {
        res.status(err.statusCode).json({
            message: err.message,
            details: err.details || undefined
        });
        return;
    }
    // Errores de SyntaxError (por ejemplo, JSON mal formado)
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json({
            message: 'Petición mal formada',
            details: 'El JSON enviado no es válido'
        });
        return;
    }
    // Cualquier otro error no manejado específicamente
    // En producción no enviamos detalles técnicos al cliente
    const isDevelopment = process.env.NODE_ENV === 'development';
    res.status(500).json({
        message: 'Error interno del servidor',
        // Solo incluir stack trace y detalles en desarrollo
        details: isDevelopment ? err.message : undefined,
        stack: isDevelopment ? err.stack : undefined
    });
};
exports.errorHandler = errorHandler;
/**
 * Función de ayuda para crear errores de API con formato consistente
 *
 * @param message Mensaje de error
 * @param statusCode Código de estado HTTP
 * @param details Detalles adicionales (opcional)
 * @returns Error personalizado con el formato requerido
 */
const createError = (message, statusCode = 500, details) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    if (details) {
        error.details = details;
    }
    return error;
};
exports.createError = createError;
/**
 * Función de ayuda para envolver un bloque de código en un try-catch
 * y pasar cualquier error al middleware next() de Express
 *
 * @param fn Función asíncrona a ejecutar con manejo de errores
 * @returns Middleware de Express con manejo de errores automático
 */
const asyncHandler = (fn) => (req, res, next) => {
    return Promise.resolve(fn(req, res, next)).catch(next);
};
exports.asyncHandler = asyncHandler;
//# sourceMappingURL=error-handler.js.map