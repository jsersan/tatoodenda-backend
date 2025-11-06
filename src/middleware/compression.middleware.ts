// src/middleware/compression.middleware.ts
import compression from 'compression';
import { Request, Response } from 'express';

/**
 * Middleware de compresión con filtro personalizado
 * Comprime respuestas JSON y HTML para reducir tamaño de transferencia
 */
export const compressionMiddleware = compression({
  // Filtro: decidir qué comprimir
  filter: (req: Request, res: Response) => {
    // No comprimir si el cliente no lo soporta
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Usar el filtro predeterminado de compression
    return compression.filter(req, res);
  },
  
  // Nivel de compresión: 6 es un buen balance velocidad/tamaño
  level: 6,
  
  // Umbral mínimo para comprimir (1KB)
  threshold: 1024,
  
  // Estrategia de compresión
  strategy: 3  // Z_RLE (mejor para JSON)
});

/**
 * Headers de cache para respuestas estáticas
 */
export const cacheControl = (req: Request, res: Response, next: Function) => {
  // Cache para imágenes y assets estáticos (1 hora)
  if (req.url.match(/\.(jpg|jpeg|png|gif|ico|css|js|woff|woff2)$/)) {
    res.setHeader('Cache-Control', 'public, max-age=3600');
  }
  // Sin cache para API endpoints
  else if (req.url.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};