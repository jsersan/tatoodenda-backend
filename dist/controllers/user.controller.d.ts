/**
 * Controlador de Usuarios - VERSIÓN FINAL CORREGIDA
 * ✅ Imports corregidos
 * ✅ JWT funcionando correctamente
 */
import { Response } from 'express';
declare global {
    namespace Express {
        interface Request {
            userId?: number;
        }
    }
}
/**
 * Controlador de usuarios
 */
declare const userController: {
    /**
     * Registrar un nuevo usuario
     */
    register: (req: Request, res: Response) => Promise<Response>;
    /**
     * ✅ LOGIN - Devuelve TODOS los campos del usuario
     */
    login: (req: Request, res: Response) => Promise<Response>;
    /**
     * Obtener perfil del usuario autenticado
     */
    profile: (req: Request, res: Response) => Promise<Response>;
    /**
     * Actualizar usuario
     */
    update: (req: Request, res: Response) => Promise<Response>;
    forgotPassword: (req: Request, res: Response) => Promise<Response>;
    resetPassword: (req: Request, res: Response) => Promise<Response>;
    verifyResetToken: (req: Request, res: Response) => Promise<Response>;
};
export default userController;
