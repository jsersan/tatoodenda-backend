/**
 * Archivo principal - Punto de entrada de la aplicación
 * Configura y arranca el servidor Express
 */
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

// Cargar variables de entorno desde archivo .env
dotenv.config();

// Importaciones internas
import db from './models';
import routes from './routes';
import { errorHandler } from './utils/error-handler';

// Inicializar Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar CORS MÁS PERMISIVO para desarrollo
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:3000'], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Manejar preflight requests explícitamente
app.options('*', cors());

// Mostrar las peticiones en la consola (para debugging)
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

app.use(express.json()); // Para parsear application/json
app.use(express.urlencoded({ extended: true })); // Para parsear application/x-www-form-urlencoded

// Servir archivos estáticos (imágenes de productos)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configurar rutas de la API
app.use('/api', routes);

// Ruta para comprobar el estado de la API
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API funcionando correctamente' });
});

// Ruta de prueba adicional
app.get('/test', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Backend funcionando correctamente' });
});

// Middleware para manejar rutas no encontradas
app.use((req: Request, res: Response) => {
  console.log(`Ruta no encontrada: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Middleware para manejo global de errores
app.use(errorHandler);

// Función para intentar conexión a la base de datos
const connectDatabase = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');
    
    // Opcional: Sincronizar modelos (solo en desarrollo)
    if (process.env.NODE_ENV === 'development') {
      // await db.sequelize.sync({ alter: true });
      console.log('📋 Modelos sincronizados con la base de datos');
    }
    
    return true;
  } catch (err) {
    console.error('❌ No se pudo conectar a la base de datos:', err);
    return false;
  }
};

// Arrancar servidor
const startServer = async () => {
  const dbConnected = await connectDatabase();
  
  if (!dbConnected) {
    console.error('❌ No se puede iniciar el servidor sin conexión a la base de datos');
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 API disponible en: http://localhost:${PORT}/api`);
    console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  });
};

// Iniciar servidor
startServer();

// Manejo de errores no capturados para evitar caídas del servidor
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});