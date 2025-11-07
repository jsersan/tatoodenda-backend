import { Request, Response } from 'express';
declare class ProductController {
    private readonly CACHE_TTL;
    /**
     * 🔍 Buscar productos por término - CON CACHE
     */
    search(req: Request, res: Response): Promise<Response>;
    /**
     * Obtener todos los productos - CON CACHE
     */
    index(req: Request, res: Response): Promise<Response>;
    /**
     * Obtener un producto por ID - CON CACHE
     */
    show(req: Request, res: Response): Promise<Response>;
    /**
     * Obtener productos por categoría - CON CACHE
     */
    getProductsByCategory(req: Request, res: Response): Promise<Response>;
    /**
     * Crear producto - INVALIDA CACHE
     */
    store(req: Request, res: Response): Promise<Response>;
    /**
     * Actualizar producto - INVALIDA CACHE
     */
    update(req: Request, res: Response): Promise<Response>;
    /**
     * Eliminar producto - INVALIDA CACHE
     */
    destroy(req: Request, res: Response): Promise<Response>;
    /**
     * Obtener Colors disponibles del producto
     */
    getColors(req: Request, res: Response): Promise<Response>;
    /**
     * Obtener imagen del producto
     */
    getImage(req: Request, res: Response): void;
}
declare const _default: ProductController;
export default _default;
