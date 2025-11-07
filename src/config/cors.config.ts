// src/config/cors.config.ts

import { CorsOptions } from 'cors';

/**
 * Lista de orígenes permitidos
 * Añade aquí todos los dominios desde los que se accederá a tu API
 */
const allowedOrigins = [
  'http://localhost:4200',      // Angular dev
  'http://localhost:4201',      // Angular dev alternativo
  'http://localhost:3000',      // Backend dev
  'https://tu-dominio.com',     // Producción (reemplazar)
  'https://www.tu-dominio.com'  // Producción con www (reemplazar)
];

/**
 * Configuración de CORS
 * Controla qué dominios pueden acceder a tu API
 */
export const corsConfig: CorsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    // En desarrollo, permitir requests sin origin (Postman, curl, etc.)
    if (process.env.NODE_ENV === 'development' && !origin) {
      console.log('✅ CORS: Request sin origin permitido (desarrollo)');
      return callback(null, true);
    }

    // Verificar si el origin está en la lista de permitidos
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS: Origin permitido:', origin || 'sin origin');
      callback(null, true);
    } else {
      console.error('❌ CORS: Origin bloqueado:', origin);
      console.error('   Orígenes permitidos:', allowedOrigins);
      callback(new Error(`Origen no permitido por CORS: ${origin}`));
    }
  },
  
  // Permitir credenciales (cookies, authorization headers)
  credentials: true,
  
  // Métodos HTTP permitidos
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS',
    'PATCH'
  ],
  
  // Headers permitidos en las requests
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Auth-Token',
    'Access-Control-Allow-Origin'
  ],
  
  // Headers expuestos en las responses
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Authorization'
  ],
  
  // Tiempo de cache para preflight requests (24 horas)
  maxAge: 86400,
  
  // Permitir preflight para todos los requests
  preflightContinue: false,
  
  // Status code para preflight success
  optionsSuccessStatus: 204
};

/**
 * Middleware adicional para logging de CORS en desarrollo
 */
export const corsLogger = (req: any, res: any, next: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n📨 CORS Request:');
    console.log('   Origin:', req.headers.origin || 'sin origin');
    console.log('   Method:', req.method);
    console.log('   Path:', req.path);
    
    if (req.method === 'OPTIONS') {
      console.log('   🔍 Preflight request detectado');
    }
  }
  next();
};

export default corsConfig;