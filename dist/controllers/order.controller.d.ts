import { Request, Response } from 'express';
export declare class OrderController {
    /**
     * ✅ MEJORADO: Crear pedido y enviar email automáticamente
     */
    static createOrder(req: Request, res: Response): Promise<any>;
    static getUserOrders(req: Request, res: Response): Promise<any>;
    static descargarAlbaran(req: Request, res: Response): Promise<any>;
    static reenviarAlbaran(req: Request, res: Response): Promise<any>;
}
export default OrderController;
