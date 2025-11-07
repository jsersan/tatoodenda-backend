"use strict";
// src/server.ts - SERVIDOR OPTIMIZADO PARA RENDER
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Importaciones internas
const models_1 = __importDefault(require("./models"));
const routes_1 = __importDefault(require("./routes"));
const error_handler_1 = require("./utils/error-handler");
const database_1 = require("./config/database"); // ✅ ACTUALIZADO
const compression_middleware_1 = require("./middleware/compression.middleware"); // ✅ NUEVO
const cache_service_1 = require("./services/cache.service"); // ✅ NUEVO
// Inicializar Express
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
console.log('🚀 Iniciando servidor TatooDenda OPTIMIZADO...');
console.log('📍 Puerto configurado:', PORT);
console.log('🌐 Entorno:', process.env.NODE_ENV || 'development');
// ✅ CORS optimizado
const corsOptions = {
    origin: [
        'http://localhost:4200',
        'http://127.0.0.1:4200',
        'http://localhost:3000',
        'http://localhost:4201',
        'https://tatoodenda.netlify.app',
        'http://txemaserrano.com',
        'https://txemaserrano.com',
        'http://www.txemaserrano.com',
        'https://www.txemaserrano.com'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Headers',
        'X-Keep-Alive',
        'X-Warm-Up' // ✅ Para pre-calentamiento
    ],
    preflightContinue: false,
    optionsSuccessStatus: 200
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions));
// ✅ NUEVO: Compresión HTTP
app.use(compression_middleware_1.compressionMiddleware);
// ✅ NUEVO: Control de cache
app.use(compression_middleware_1.cacheControl);
// ✅ Middleware de logging optimizado
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    // Solo log en desarrollo o para endpoints críticos
    if (process.env.NODE_ENV === 'development' ||
        req.url.includes('/login') ||
        req.url.includes('/register') ||
        req.url.includes('/pedidos')) {
        console.log(`[${timestamp}] ${req.method} ${req.url}`);
    }
    next();
});
// Middleware para parsear datos
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Servir archivos estáticos
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, '../public/assets')));
// ✅ NUEVO: Health check mejorado (para keep-alive)
app.get('/health', (req, res) => {
    const isKeepAlive = req.headers['x-keep-alive'] === 'true';
    const isWarmUp = req.headers['x-warm-up'] === 'true';
    if (isKeepAlive) {
        console.log('📡 Keep-Alive ping recibido');
    }
    if (isWarmUp) {
        console.log('🔥 Warm-up request recibido');
    }
    res.status(200).json({
        status: 'OK',
        message: 'Servidor TatooDenda funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        uptime: process.uptime(),
        memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        cache: cache_service_1.cacheService.getStats()
    });
});
// ✅ NUEVO: Endpoint para limpiar cache (solo admin)
app.post('/api/cache/clear', (req, res) => {
    // TODO: Añadir verificación de admin
    cache_service_1.cacheService.clear();
    res.status(200).json({
        message: 'Cache limpiado correctamente',
        timestamp: new Date().toISOString()
    });
});
// Ruta de test básica
app.get('/test', (req, res) => {
    res.status(200).json({
        message: 'Backend TatooDenda funcionando correctamente',
        database: 'conectada',
        api: 'disponible en /api'
    });
});
// Configurar rutas de la API
app.use('/api', routes_1.default);
// Ruta raíz con información de la API
app.get('/', (req, res) => {
    res.status(200).json({
        name: 'TatooDenda API',
        version: '1.0.0',
        description: 'API para la tienda online de tatuajes y piercings',
        status: 'running',
        endpoints: {
            health: '/health',
            test: '/test',
            api: '/api',
            users: '/api/users',
            categories: '/api/categorias',
            products: '/api/productos',
            orders: '/api/pedidos'
        },
        optimization: {
            compression: 'enabled',
            cache: 'in-memory',
            keepAlive: 'enabled'
        }
    });
});
// Middleware para rutas no encontradas
app.use((req, res) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({
        message: 'Ruta no encontrada',
        method: req.method,
        url: req.url,
        suggestion: 'Verifica que la URL sea correcta y que el endpoint exista'
    });
});
// Middleware para manejo global de errores
app.use(error_handler_1.errorHandler);
// ✅ Función de inicio optimizada con reintentos
const startServer = async () => {
    try {
        console.log('🚀 Iniciando proceso de arranque del servidor...');
        // 1. Inicializar base de datos con reintentos
        const dbConnected = await (0, database_1.initializeDatabase)(3, 5000);
        if (!dbConnected) {
            console.error('❌ No se puede iniciar el servidor sin conexión a la base de datos');
            process.exit(1);
        }
        // 2. Iniciar servidor HTTP
        const server = app.listen(PORT, () => {
            console.log('\n🎉 ================================');
            console.log('🎉 SERVIDOR TATOODENDA OPTIMIZADO');
            console.log('🎉 ================================');
            console.log(`🌐 Servidor ejecutándose en puerto: ${PORT}`);
            console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 URLs disponibles:`);
            console.log(`   • Health check: http://localhost:${PORT}/health`);
            console.log(`   • Test endpoint: http://localhost:${PORT}/test`);
            console.log(`   • API base: http://localhost:${PORT}/api`);
            console.log(`✨ Optimizaciones activas:`);
            console.log(`   • ✅ Compresión HTTP (gzip)`);
            console.log(`   • ✅ Cache en memoria`);
            console.log(`   • ✅ Pool de conexiones optimizado`);
            console.log(`   • ✅ Keep-alive endpoint`);
            console.log('🎉 ================================\n');
        });
        // 3. Configurar timeout del servidor (importante para Render)
        server.timeout = 120000; // 2 minutos
        server.keepAliveTimeout = 65000; // 65 segundos (más que el LB de Render)
        server.headersTimeout = 66000; // 66 segundos
        // 4. Configurar manejo de cierre graceful
        const gracefulShutdown = (signal) => {
            console.log(`\n📴 Recibida señal ${signal}, cerrando servidor gracefully...`);
            // Detener verificación de DB
            (0, database_1.stopConnectionCheck)();
            // Detener limpieza de cache
            cache_service_1.cacheService.stopCleanup();
            server.close(async () => {
                console.log('🔌 Servidor HTTP cerrado');
                try {
                    await models_1.default.sequelize.close();
                    console.log('🔌 Conexión a base de datos cerrada');
                }
                catch (error) {
                    console.error('❌ Error al cerrar conexión a base de datos:', error);
                }
                console.log('👋 Servidor cerrado completamente');
                process.exit(0);
            });
            // Forzar cierre después de 30 segundos
            setTimeout(() => {
                console.error('⚠️ Forzando cierre del servidor...');
                process.exit(1);
            }, 30000);
        };
        // 5. Escuchar señales de cierre
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    }
    catch (error) {
        console.error('💥 Error fatal al iniciar el servidor:', error);
        process.exit(1);
    }
};
// Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});
// Iniciar servidor
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map