// src/middleware/debug.middleware.ts

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para debugging de requests
 * Solo activo en desarrollo
 */
export const debugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  const startTime = Date.now();
  
  console.log('\n📨 ================================');
  console.log(`🔵 ${req.method} ${req.path}`);
  console.log('📅 Timestamp:', new Date().toISOString());
  
  // Log de headers importantes
  console.log('📋 Headers:');
  console.log('   Origin:', req.headers.origin || 'N/A');
  console.log('   Authorization:', req.headers.authorization ? 'Presente' : 'Ausente');
  console.log('   Content-Type:', req.headers['content-type'] || 'N/A');
  
  // Log de query params
  if (Object.keys(req.query).length > 0) {
    console.log('🔍 Query params:', req.query);
  }
  
  // Log de body (solo si no es muy grande)
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body);
    if (bodyStr.length < 500) {
      console.log('📦 Body:', req.body);
    } else {
      console.log('📦 Body: (demasiado grande para mostrar)');
    }
  }

  // Interceptar la respuesta
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    const duration = Date.now() - startTime;
    console.log(`✅ Response ${res.statusCode} - ${duration}ms`);
    
    // Si es un array, mostrar cantidad
    if (Array.isArray(data)) {
      console.log(`   📊 Devolviendo ${data.length} elementos`);
    }
    
    console.log('📨 ================================\n');
    return originalJson(data);
  };

  next();
};

/**
 * Middleware específico para debugging de categorías
 */
export const categoryDebugMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV !== 'development') {
    return next();
  }

  console.log('\n🏷️  ================================');
  console.log('🏷️  REQUEST A CATEGORÍAS');
  console.log('🏷️  ================================');
  console.log('   Método:', req.method);
  console.log('   Path:', req.path);
  console.log('   Origin:', req.headers.origin);
  console.log('   User-Agent:', req.headers['user-agent']?.substring(0, 50));
  
  // Interceptar respuesta
  const originalJson = res.json.bind(res);
  res.json = function(data: any) {
    console.log('🏷️  Categorías devueltas:', Array.isArray(data) ? data.length : 'objeto único');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('   Primera categoría:', {
        id: data[0].id,
        nombre: data[0].nombre,
        padre: data[0].padre
      });
    }
    
    console.log('🏷️  ================================\n');
    return originalJson(data);
  };

  next();
};

/**
 * Middleware para logging de errores detallado
 */
export const errorLoggerMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('\n❌ ================================');
  console.error('❌ ERROR EN EL SERVIDOR');
  console.error('❌ ================================');
  console.error('   Path:', req.path);
  console.error('   Method:', req.method);
  console.error('   Error:', err.message);
  console.error('   Stack:', err.stack);
  console.error('❌ ================================\n');
  
  next(err);
};

export default {
  debugMiddleware,
  categoryDebugMiddleware,
  errorLoggerMiddleware
};