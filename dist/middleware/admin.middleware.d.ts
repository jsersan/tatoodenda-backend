/**
 * Middleware de Administrador
 * Verifica que el usuario autenticado tenga permisos de administrador
 */
import { Response } from 'express';
/**
 * Middleware para verificar permisos de administrador
 * Debe utilizarse después del middleware verifyToken
 */
export declare const isAdmin: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;
