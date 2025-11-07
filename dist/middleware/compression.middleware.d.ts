/**
 * Middleware de compresión con filtro personalizado
 * Comprime respuestas JSON y HTML para reducir tamaño de transferencia
 */
export declare const compressionMiddleware: any;
/**
 * Headers de cache para respuestas estáticas
 */
export declare const cacheControl: (req: Request, res: Response, next: Function) => void;
