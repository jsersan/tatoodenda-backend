// src/server.ts - SERVIDOR CON KEEP-ALIVE INTEGRADO

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { compressionMiddleware } from './middleware/compression.middleware';
import routes from './routes';
import db from './models';
import { errorHandler } from './middleware/error.middleware';
import { keepAliveService } from './services/keep-alive.service'; // ✅ NUEVO

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🚀 Iniciando servidor TatooDenda...');
console.log('📍 Puerto configurado:', PORT);
console.log('🌍 Entorno:', process.env.NODE_ENV || 'development');

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
    'X-Keep-Alive', // ✅ Header para keep-alive
    'X-Warm-Up'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ Compresión HTTP
app.use(compressionMiddleware);

// ✅ Control de cache
const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  if (req.url.match(/\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  } else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
};

app.use(cacheControl);

// ✅ Middleware de logging optimizado
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  
  // Detectar si es un keep-alive ping
  const isKeepAlive = req.headers['x-keep-alive'] === 'true';
  
  if (isKeepAlive) {
    console.log(`🔄 [${timestamp}] Keep-Alive ping recibido`);
  } else if (process.env.NODE_ENV === 'development' || 
      req.url.includes('/login') || 
      req.url.includes('/register') ||
      req.url.includes('/pedidos')) {
    console.log(`[${timestamp}] ${req.method} ${req.url}`);
  }
  
  next();
});

// Middleware para parsear datos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// ✅ HEALTH CHECK MEJORADO (esencial para keep-alive)
app.get('/health', (req: Request, res: Response) => {
  const isKeepAlive = req.headers['x-keep-alive'] === 'true';
  
  // Si es un ping de keep-alive, respuesta mínima
  if (isKeepAlive) {
    return res.status(200).json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      keepAlive: true
    });
  }
  
  // Respuesta completa para checks externos
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    },
    keepAliveStats: keepAliveService.getStats()
  });
});

// ✅ NUEVO: Endpoint para estadísticas de keep-alive
app.get('/api/keep-alive/stats', (req: Request, res: Response) => {
  const stats = keepAliveService.getStats();
  res.status(200).json({
    success: true,
    data: stats
  });
});

// ✅ NUEVO: Endpoint manual para despertar el servidor (útil desde frontend)
app.post('/api/wake-up', (req: Request, res: Response) => {
  console.log('🌅 Wake-up request recibido');
  res.status(200).json({
    success: true,
    message: 'Servidor despierto y listo',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Ruta de test básica
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ 
    message: 'Backend TatooDenda funcionando correctamente',
    database: 'conectada',
    api: 'disponible en /api'
  });
});

// Configurar rutas de la API
app.use('/api', routes);

// Ruta raíz con información de la API
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'TatooDenda API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      wakeUp: '/api/wake-up',
      keepAliveStats: '/api/keep-alive/stats',
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
      keepAlive: keepAliveService.isRunning() ? 'active' : 'inactive'
    }
  });
});

// Middleware para rutas no encontradas
app.use((req: Request, res: Response) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    method: req.method,
    url: req.url,
    suggestion: 'Verifica que la URL sea correcta y que el endpoint exista'
  });
});

// Middleware para manejo global de errores
app.use(errorHandler);

// ✅ Función para inicializar la base de datos con reintentos
const initializeDatabase = async (maxRetries: number = 3, delay: number = 5000): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Intento ${attempt}/${maxRetries} de conexión a la base de datos...`);
      
      await db.sequelize.authenticate();
      console.log('✅ Conexión a base de datos establecida correctamente');
      
      if (process.env.NODE_ENV === 'development') {
        await db.sequelize.sync({ alter: false });
        console.log('✅ Modelos sincronizados');
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Error en intento ${attempt}:`, error);
      
      if (attempt < maxRetries) {
        console.log(`⏳ Esperando ${delay/1000}s antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return false;
};

// ✅ Función de inicio con keep-alive
const startServer = async () => {
  try {
    console.log('🚀 Iniciando proceso de arranque del servidor...');
    
    // 1. Inicializar base de datos
    const dbConnected = await initializeDatabase(3, 5000);
    
    if (!dbConnected) {
      console.error('❌ No se puede iniciar el servidor sin conexión a la base de datos');
      process.exit(1);
    }
    
    // 2. Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      console.log('\n🎉 ================================');
      console.log('🎉 SERVIDOR TATOODENDA OPTIMIZADO');
      console.log('🎉 ================================');
      console.log(`🌍 Servidor ejecutándose en puerto: ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URLs disponibles:`);
      console.log(`   • Health check: http://localhost:${PORT}/health`);
      console.log(`   • Wake up: http://localhost:${PORT}/api/wake-up`);
      console.log(`   • Keep-Alive stats: http://localhost:${PORT}/api/keep-alive/stats`);
      console.log(`   • Test endpoint: http://localhost:${PORT}/test`);
      console.log(`   • API base: http://localhost:${PORT}/api`);
      console.log(`✨ Optimizaciones activas:`);
      console.log(`   • ✅ Compresión HTTP (gzip)`);
      console.log(`   • ✅ Cache en memoria`);
      console.log(`   • ✅ Pool de conexiones optimizado`);
      
      // ✅ 3. INICIAR KEEP-ALIVE (solo en producción)
      if (process.env.NODE_ENV === 'production') {
        console.log(`   • ✅ Keep-Alive automático`);
        keepAliveService.start();
      } else {
        console.log(`   • ℹ️  Keep-Alive desactivado (desarrollo)`);
      }
      
      console.log('🎉 ================================\n');
    });
    
    // 4. Configurar timeout del servidor
    server.timeout = 120000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    
    // 5. Configurar cierre graceful
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🔴 Recibida señal ${signal}, cerrando servidor gracefully...`);
      
      // ✅ Detener keep-alive
      keepAliveService.stop();
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        try {
          await db.sequelize.close();
          console.log('🔌 Conexión a base de datos cerrada');
        } catch (error) {
          console.error('❌ Error al cerrar conexión a base de datos:', error);
        }
        
        console.log('👋 Servidor cerrado completamente');
        process.exit(0);
      });
      
      setTimeout(() => {
        console.error('⚠️ Forzando cierre del servidor...');
        process.exit(1);
      }, 30000);
    };
    
    // 6. Escuchar señales de cierre
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
  } catch (error) {
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

// ✅ INICIAR SERVIDOR
startServer();

export default app;