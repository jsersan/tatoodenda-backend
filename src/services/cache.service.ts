// src/services/cache.service.ts
/**
 * Servicio de cache en memoria simple pero efectivo
 * Reduce consultas a la BD para datos que no cambian frecuentemente
 */

interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;  // Time to live en milisegundos
  }
  
  class CacheService {
    private cache: Map<string, CacheEntry>;
    private cleanupInterval: NodeJS.Timeout | null;
  
    constructor() {
      this.cache = new Map();
      this.cleanupInterval = null;
      this.startCleanup();
    }
  
    /**
     * Guardar en cache
     * @param key Clave única
     * @param data Datos a guardar
     * @param ttl Tiempo de vida en segundos (por defecto 5 minutos)
     */
    set(key: string, data: any, ttl: number = 300): void {
      const entry: CacheEntry = {
        data,
        timestamp: Date.now(),
        ttl: ttl * 1000  // Convertir a milisegundos
      };
      
      this.cache.set(key, entry);
      console.log(`📦 Cache SET: ${key} (TTL: ${ttl}s)`);
    }
  
    /**
     * Obtener del cache
     * @param key Clave a buscar
     * @returns Datos o null si no existe o expiró
     */
    get(key: string): any | null {
      const entry = this.cache.get(key);
      
      if (!entry) {
        console.log(`❌ Cache MISS: ${key}`);
        return null;
      }
      
      // Verificar si expiró
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl) {
        console.log(`⏰ Cache EXPIRED: ${key}`);
        this.cache.delete(key);
        return null;
      }
      
      console.log(`✅ Cache HIT: ${key}`);
      return entry.data;
    }
  
    /**
     * Eliminar del cache
     */
    delete(key: string): boolean {
      const deleted = this.cache.delete(key);
      if (deleted) {
        console.log(`🗑️ Cache DELETE: ${key}`);
      }
      return deleted;
    }
  
    /**
     * Eliminar por patrón (ej: "products:*")
     */
    deletePattern(pattern: string): number {
      const regex = new RegExp(pattern.replace('*', '.*'));
      let count = 0;
      
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
          count++;
        }
      }
      
      if (count > 0) {
        console.log(`🗑️ Cache DELETE PATTERN: ${pattern} (${count} eliminados)`);
      }
      
      return count;
    }
  
    /**
     * Limpiar todo el cache
     */
    clear(): void {
      const size = this.cache.size;
      this.cache.clear();
      console.log(`🗑️ Cache CLEAR: ${size} entradas eliminadas`);
    }
  
    /**
     * Obtener estadísticas
     */
    getStats(): { size: number; keys: string[] } {
      return {
        size: this.cache.size,
        keys: Array.from(this.cache.keys())
      };
    }
  
    /**
     * Limpieza automática de entradas expiradas
     */
    private startCleanup(): void {
      // Limpiar cada 5 minutos
      this.cleanupInterval = setInterval(() => {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, entry] of this.cache.entries()) {
          if (now - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            cleaned++;
          }
        }
        
        if (cleaned > 0) {
          console.log(`🧹 Cache CLEANUP: ${cleaned} entradas expiradas eliminadas`);
        }
      }, 5 * 60 * 1000);  // Cada 5 minutos
    }
  
    /**
     * Detener limpieza automática
     */
    stopCleanup(): void {
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
        console.log('🛑 Cache cleanup detenido');
      }
    }
  }
  
  // Exportar instancia singleton
  export const cacheService = new CacheService();
  
  /**
   * Middleware para cachear respuestas GET
   * Uso: router.get('/productos', cacheMiddleware(300), controller.getAll);
   */
  export const cacheMiddleware = (ttl: number = 300) => {
    return (req: any, res: any, next: any) => {
      // Solo cachear GET requests
      if (req.method !== 'GET') {
        return next();
      }
      
      const key = `route:${req.originalUrl}`;
      const cachedData = cacheService.get(key);
      
      if (cachedData) {
        return res.json(cachedData);
      }
      
      // Sobrescribir res.json para guardar en cache
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        cacheService.set(key, data, ttl);
        return originalJson(data);
      };
      
      next();
    };
  };