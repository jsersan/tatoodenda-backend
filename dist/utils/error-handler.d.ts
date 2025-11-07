/**
 * Interfaz que define la estructura de un error personalizado de la API
 */
interface APIError extends Error {
    statusCode?: number;
    errors?: any[];
    details?: string;
}
/**
 * Middleware para manejar errores de la aplicación
 * Procesa diferentes tipos de errores y devuelve respuestas consistentes
 *
 * @param err Error capturado
 * @param req Objeto Request de Express
 * @param res Objeto Response de Express
 * @param next Función NextFunction de Express
 */
export declare const errorHandler: (err: Error | APIError, req: Request, res: Response, next: NextFunction) => void;
/**
 * Función de ayuda para crear errores de API con formato consistente
 *
 * @param message Mensaje de error
 * @param statusCode Código de estado HTTP
 * @param details Detalles adicionales (opcional)
 * @returns Error personalizado con el formato requerido
 */
export declare const createError: (message: string, statusCode?: number, details?: string | undefined) => APIError;
/**
 * Función de ayuda para envolver un bloque de código en un try-catch
 * y pasar cualquier error al middleware next() de Express
 *
 * @param fn Función asíncrona a ejecutar con manejo de errores
 * @returns Middleware de Express con manejo de errores automático
 */
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
