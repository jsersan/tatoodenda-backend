/**
 * Esquema para validar solicitudes de inicio de sesión
 */
export declare const loginSchema: any;
/**
 * Esquema para validar solicitudes de registro
 */
export declare const registerSchema: any;
/**
 * Esquema para validar solicitudes de actualización de usuario
 */
export declare const updateUserSchema: any;
/**
 * Esquema para validar solicitudes de creación/actualización de categoría
 */
export declare const categorySchema: any;
/**
 * Esquema para validar solicitudes de creación/actualización de producto
 */
export declare const productSchema: any;
/**
 * Esquema para validar solicitudes de creación de color de producto
 */
export declare const productColorSchema: any;
/**
 * Esquema para validar líneas de pedido
 */
export declare const orderLineSchema: any;
/**
 * Esquema para validar solicitudes de creación de pedido
 */
export declare const orderSchema: any;
/**
 * Middleware para validar solicitudes con Zod
 * @param schema Esquema Zod para validar
 * @returns Middleware de Express
 */
export declare const validate: (schema: z.ZodSchema) => (req: any, res: any, next: any) => any;
