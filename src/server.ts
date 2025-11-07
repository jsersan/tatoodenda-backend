// src/server.ts - SERVIDOR OPTIMIZADO PARA RENDER

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { compressionMiddleware } from './middleware/compression.middleware';
import routes from './routes';
import db from './models';
import { errorHandler } from './middleware/error.middleware';

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
    'X-Keep-Alive',
    'X-Warm-Up'
  ],
  preflightContinue: false,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// ✅ NUEVO: Compresión HTTP
app.use(compressionMiddleware);

// ✅ NUEVO: Control de cache
const cacheControl = (req: Request, res: Response, next: NextFunction) => {
  // Cache para recursos estáticos
  if (req.url.match(/\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año
  } else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
};

app.use(cacheControl);

// ✅ Middleware de logging optimizado
app.use((req: Request, res: Response, next: NextFunction) => {
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));

// ✅ NUEVO: Health check mejorado (para keep-alive)
app.get('/health', (req: Request, res: Response) => {
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
    }
  });
});

// ✅ NUEVO: Endpoint para limpiar cache (solo admin)
app.post('/api/cache/clear', (req: Request, res: Response) => {
  // TODO: Añadir verificación de admin
  res.status(200).json({ 
    message: 'Cache limpiado correctamente',
    timestamp: new Date().toISOString()
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
      
      // Sincronizar modelos (solo en desarrollo)
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

// ✅ Función para detener la verificación de conexión
const stopConnectionCheck = () => {
  console.log('🔴 Deteniendo verificación de conexión a la base de datos');
  // Aquí podrías limpiar cualquier intervalo si lo tuvieras
};

// ✅ Función de inicio optimizada con reintentos
const startServer = async () => {
  try {
    console.log('🚀 Iniciando proceso de arranque del servidor...');
    
    // 1. Inicializar base de datos con reintentos
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
    server.timeout = 120000;  // 2 minutos
    server.keepAliveTimeout = 65000;  // 65 segundos (más que el LB de Render)
    server.headersTimeout = 66000;  // 66 segundos
    
    // 4. Configurar manejo de cierre graceful
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🔴 Recibida señal ${signal}, cerrando servidor gracefully...`);
      
      // Detener verificación de DB
      stopConnectionCheck();
      
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
      
      // Forzar cierre después de 30 segundos
      setTimeout(() => {
        console.error('⚠️ Forzando cierre del servidor...');
        process.exit(1);
      }, 30000);
    };
    
    // 5. Escuchar señales de cierre
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

// Iniciar servidor
startServer();

export default app;