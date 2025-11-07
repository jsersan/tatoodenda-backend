/**
 * Servicio de cache en memoria simple pero efectivo
 * Reduce consultas a la BD para datos que no cambian frecuentemente
 */
declare class CacheService {
    private cache;
    private cleanupInterval;
    constructor();
    /**
     * Guardar en cache
     * @param key Clave única
     * @param data Datos a guardar
     * @param ttl Tiempo de vida en segundos (por defecto 5 minutos)
     */
    set(key: string, data: any, ttl?: number): void;
    /**
     * Obtener del cache
     * @param key Clave a buscar
     * @returns Datos o null si no existe o expiró
     */
    get(key: string): any | null;
    /**
     * Eliminar del cache
     */
    delete(key: string): boolean;
    /**
     * Eliminar por patrón (ej: "products:*")
     */
    deletePattern(pattern: string): number;
    /**
     * Limpiar todo el cache
     */
    clear(): void;
    /**
     * Obtener estadísticas
     */
    getStats(): {
        size: number;
        keys: string[];
    };
    /**
     * Limpieza automática de entradas expiradas
     */
    private startCleanup;
    /**
     * Detener limpieza automática
     */
    stopCleanup(): void;
}
export declare const cacheService: CacheService;
/**
 * Middleware para cachear respuestas GET
 * Uso: router.get('/productos', cacheMiddleware(300), controller.getAll);
 */
export declare const cacheMiddleware: (ttl?: number) => (req: any, res: any, next: any) => any;
export {};
