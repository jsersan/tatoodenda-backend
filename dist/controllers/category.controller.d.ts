/**
 * Controlador de Categorías
 * Maneja la lógica de negocio para operaciones relacionadas con categorías
 */
import { Response } from 'express';
/**
 * Controlador de categorías
 */
declare const categoryController: {
    /**
     * Obtiene todas las categorías
     * GET /api/categorias
     */
    findAll: (req: Request, res: Response) => Promise<Response>;
    /**
     * Obtiene una categoría específica por ID
     * GET /api/categorias/:id
     */
    findOne: (req: Request, res: Response) => Promise<Response>;
    /**
     * Crea una nueva categoría
     * POST /api/categorias
     */
    create: (req: Request, res: Response) => Promise<Response>;
    /**
     * Actualiza una categoría existente
     * PUT /api/categorias/:id
     */
    update: (req: Request, res: Response) => Promise<Response>;
    /**
     * Elimina una categoría
     * DELETE /api/categorias/:id
     */
    delete: (req: Request, res: Response) => Promise<Response>;
};
export default categoryController;
