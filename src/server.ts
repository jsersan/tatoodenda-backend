// src/server.ts - VERSIÓN COMPLETA CON TODAS LAS RUTAS

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Importar rutas
import routes from './routes';

// Importar configuración de base de datos
import db from './models';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:4200';

console.log('🚀 Iniciando servidor TatooDenda...');
console.log('📍 Puerto configurado:', PORT);
console.log('🌐 Frontend URL:', FRONTEND_URL);

// ========================================
// CONFIGURACIÓN DE CORS COMPLETA
// ========================================
const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // Lista de orígenes permitidos
    const allowedOrigins = [
      'http://localhost:4200',
      'http://localhost:4201',
      FRONTEND_URL,
      // Añade tu dominio de producción aquí
      'https://tu-dominio.com'
    ];

    // Permitir requests sin origin (como Postman) en desarrollo
    if (!origin && process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.error('❌ CORS bloqueado para origen:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true, // Permitir cookies y credenciales
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400 // 24 horas
};

app.use(cors(corsOptions));

// ========================================
// MIDDLEWARE BÁSICO
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes de productos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// ========================================
// LOGGING DE REQUESTS (DESARROLLO)
// ========================================
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// ========================================
// RUTAS DE LA API
// ========================================
app.use('/api', routes);

// ========================================
// RUTAS DE HEALTH CHECK
// ========================================
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    name: 'TatooDenda API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      api: '/api',
      categories: '/api/categorias',
      products: '/api/productos',
      users: '/api/users',
      orders: '/api/pedidos'
    }
  });
});

// ========================================
// MANEJO DE ERRORES 404
// ========================================
app.use((req: Request, res: Response) => {
  console.log('⚠️ Ruta no encontrada:', req.method, req.path);
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    path: req.url,
    method: req.method
  });
});

// ========================================
// MANEJO DE ERRORES GENERAL
// ========================================
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error del servidor:', err);
  
  // Error de CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'Error de CORS - Origen no permitido',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
  
  res.status(err.status || 500).json({ 
    success: false,
    message: 'Error del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// ========================================
// INICIALIZACIÓN DEL SERVIDOR
// ========================================
const startServer = async () => {
  try {
    // Conectar a la base de datos
    console.log('🔌 Conectando a la base de datos...');
    await db.testConnection();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n🎉 ================================');
      console.log('✅ SERVIDOR INICIADO CORRECTAMENTE');
      console.log('🎉 ================================');
      console.log(`🌐 Puerto: ${PORT}`);
      console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`🔗 Health: http://localhost:${PORT}/health`);
      console.log(`🔗 Categorías: http://localhost:${PORT}/api/categorias`);
      console.log('🎉 ================================\n');
    });
  } catch (error) {
    console.error('💥 Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();

export default app;