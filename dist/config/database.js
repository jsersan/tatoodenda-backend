"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stopConnectionCheck = exports.initializeDatabase = exports.sequelize = void 0;
// src/config/database.ts - OPTIMIZADO PARA RENDER
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ✅ Pool de conexiones optimizado para Render
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'tatoodenda_db',
    dialect: process.env.DB_DIALECT || 'mysql',
    pool: {
        max: 10,
        min: 2,
        acquire: 60000,
        idle: 30000 // ✅ 30 segundos antes de cerrar conexión inactiva
    }
};
// ✅ Añadir opciones para producción (Render)
if (process.env.NODE_ENV === 'production') {
    config.dialectOptions = {
        connectTimeout: 60000,
        ssl: {
            require: true,
            rejectUnauthorized: false // Importante para algunos hosts MySQL
        }
    };
}
// ✅ Instancia de Sequelize con retry automático
const sequelize = new sequelize_1.Sequelize(config.database, config.user, config.password, {
    host: config.host,
    dialect: config.dialect,
    pool: config.pool,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: config.dialectOptions,
    // ✅ Retry automático en caso de fallo
    retry: {
        max: 3,
        match: [
            /SequelizeConnectionError/,
            /SequelizeConnectionRefusedError/,
            /SequelizeHostNotFoundError/,
            /SequelizeHostNotReachableError/,
            /SequelizeInvalidConnectionError/,
            /SequelizeConnectionTimedOutError/
        ]
    },
    // ✅ Benchmark queries en desarrollo
    benchmark: process.env.NODE_ENV === 'development',
    // ✅ Configuración adicional
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        timestamps: true,
        underscored: false
    }
});
exports.sequelize = sequelize;
// ✅ Verificar y mantener conexión activa
let connectionCheckInterval;
const startConnectionCheck = () => {
    // Verificar conexión cada 5 minutos
    connectionCheckInterval = setInterval(async () => {
        try {
            await sequelize.authenticate();
            console.log('✅ Verificación de conexión DB: OK');
        }
        catch (error) {
            console.error('❌ Verificación de conexión DB: FALLÓ', error);
            // Intentar reconectar
            try {
                await sequelize.authenticate();
                console.log('✅ Reconexión exitosa');
            }
            catch (retryError) {
                console.error('❌ Reconexión falló:', retryError);
            }
        }
    }, 5 * 60 * 1000); // Cada 5 minutos
};
// ✅ Detener verificación al cerrar
const stopConnectionCheck = () => {
    if (connectionCheckInterval) {
        clearInterval(connectionCheckInterval);
        console.log('🔌 Verificación de conexión DB detenida');
    }
};
exports.stopConnectionCheck = stopConnectionCheck;
// ✅ Función de inicialización de BD con retry
const initializeDatabase = async (retries = 3, delay = 5000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`🔌 Intento ${attempt}/${retries}: Conectando a la base de datos...`);
            await sequelize.authenticate();
            console.log('✅ Conexión a la base de datos establecida correctamente');
            // Iniciar verificación periódica
            startConnectionCheck();
            return true;
        }
        catch (error) {
            console.error(`❌ Intento ${attempt}/${retries} falló:`, error);
            if (attempt < retries) {
                console.log(`⏳ Esperando ${delay / 1000}s antes de reintentar...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            else {
                console.error('❌ No se pudo conectar a la base de datos después de todos los intentos');
                throw error;
            }
        }
    }
    return false;
};
exports.initializeDatabase = initializeDatabase;
exports.default = config;
//# sourceMappingURL=database.js.map