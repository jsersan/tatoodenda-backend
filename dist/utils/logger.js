"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
/**
 * Sistema de logging estructurado para la aplicación
 * Utiliza Winston para generación de logs con diferentes niveles
 */
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Directorio para almacenar los archivos de logs
const logDir = path_1.default.join(__dirname, '../../logs');
// Crear el directorio de logs si no existe
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
// Formato personalizado para los logs
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.splat(), winston_1.default.format.json());
// Formato personalizado para los logs de consola
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.printf((_a) => {
    var { level, message, timestamp } = _a, meta = __rest(_a, ["level", "message", "timestamp"]);
    const metaStr = Object.keys(meta).length
        ? '\n' + JSON.stringify(meta, null, 2)
        : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
}));
// Configuración de transportes para diferentes entornos
// Configuración de transportes para diferentes entornos
const getTransports = () => {
    const transports = [];
    // En desarrollo, mostrar logs en consola con colores
    if (process.env.NODE_ENV !== 'production') {
        transports.push(new winston_1.default.transports.Console({
            level: 'debug',
            format: consoleFormat
        }));
        // En desarrollo también guardar en archivo
        try {
            ensureLogDir();
            transports.push(new winston_1.default.transports.File({
                filename: path_1.default.join(logDir, 'error.log'),
                level: 'error',
                format: logFormat
            }));
        }
        catch (error) {
            console.warn('No se pueden crear archivos de log en desarrollo');
        }
    }
    else {
        // En producción, usar principalmente consola (Render captura esto)
        transports.push(new winston_1.default.transports.Console({
            level: 'info',
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json())
        }));
        // Intentar crear archivo de logs en /tmp si es posible
        try {
            ensureLogDir();
            transports.push(new winston_1.default.transports.File({
                filename: path_1.default.join(logDir, 'error.log'),
                level: 'error',
                format: logFormat,
                maxsize: 5242880,
                maxFiles: 2
            }));
        }
        catch (error) {
            // Si no se puede escribir en disco, solo usar consola
            console.warn('Logs solo en consola (no se puede escribir en disco)');
        }
    }
    return transports;
};
// Crear el logger
const logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels: winston_1.default.config.npm.levels,
    format: logFormat,
    transports: getTransports(),
    // No salir ante errores no manejados
    exitOnError: false
});
// Formatear objetos de error para logging
const formatError = (error) => {
    return Object.assign({ message: error.message, stack: error.stack, name: error.name, code: error.code }, error);
};
// Middleware para logging de solicitudes HTTP
const requestLogger = (req, res, next) => {
    // Registrar la solicitud entrante
    const start = Date.now();
    // Registrar al final de la solicitud
    res.on('finish', () => {
        const duration = Date.now() - start;
        // Log a nivel de información para solicitudes normales
        if (res.statusCode < 400) {
            logger.info('HTTP Request', {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip
            });
        }
        // Log a nivel de advertencia para errores de cliente
        else if (res.statusCode < 500) {
            logger.warn('HTTP Request (Client Error)', {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip
            });
        }
        // Log a nivel de error para errores de servidor
        else {
            logger.error('HTTP Request (Server Error)', {
                method: req.method,
                url: req.originalUrl,
                status: res.statusCode,
                duration: `${duration}ms`,
                ip: req.ip
            });
        }
    });
    next();
};
exports.requestLogger = requestLogger;
// Exportar el logger personalizado con métodos convenientes
exports.default = {
    // Niveles de log estándar
    error: (message, meta) => {
        return logger.error(message, meta);
    },
    warn: (message, meta) => {
        return logger.warn(message, meta);
    },
    info: (message, meta) => {
        return logger.info(message, meta);
    },
    debug: (message, meta) => {
        return logger.debug(message, meta);
    },
    // Método específico para errores
    logError: (message, error) => {
        return logger.error(message, formatError(error));
    },
    // Método para logs de acceso/autenticación
    auth: (message, user, meta) => {
        return logger.info(message, Object.assign({ user }, meta));
    }
};
function ensureLogDir() {
    throw new Error('Function not implemented.');
}
//# sourceMappingURL=logger.js.map