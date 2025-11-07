"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.orderSchema = exports.orderLineSchema = exports.productColorSchema = exports.productSchema = exports.categorySchema = exports.updateUserSchema = exports.registerSchema = exports.loginSchema = void 0;
/**
 * Esquemas de validación con Zod
 * Define esquemas para validar datos de entrada en las solicitudes
 */
const zod_1 = require("zod");
/**
 * Esquema para validar solicitudes de inicio de sesión
 */
exports.loginSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
        .max(30, { message: 'El nombre de usuario no puede exceder los 30 caracteres' }),
    password: zod_1.z.string()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
});
/**
 * Esquema para validar solicitudes de registro
 */
exports.registerSchema = zod_1.z.object({
    username: zod_1.z.string()
        .min(3, { message: 'El nombre de usuario debe tener al menos 3 caracteres' })
        .max(30, { message: 'El nombre de usuario no puede exceder los 30 caracteres' }),
    password: zod_1.z.string()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
    email: zod_1.z.string()
        .email({ message: 'Debe proporcionar un correo electrónico válido' }),
    nombre: zod_1.z.string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' }),
    direccion: zod_1.z.string()
        .min(5, { message: 'La dirección debe tener al menos 5 caracteres' }),
    ciudad: zod_1.z.string()
        .min(2, { message: 'La ciudad debe tener al menos 2 caracteres' }),
    cp: zod_1.z.string()
        .regex(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos' })
});
/**
 * Esquema para validar solicitudes de actualización de usuario
 */
exports.updateUserSchema = zod_1.z.object({
    password: zod_1.z.string()
        .min(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
        .optional(),
    email: zod_1.z.string()
        .email({ message: 'Debe proporcionar un correo electrónico válido' })
        .optional(),
    nombre: zod_1.z.string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .optional(),
    direccion: zod_1.z.string()
        .min(5, { message: 'La dirección debe tener al menos 5 caracteres' })
        .optional(),
    ciudad: zod_1.z.string()
        .min(2, { message: 'La ciudad debe tener al menos 2 caracteres' })
        .optional(),
    cp: zod_1.z.string()
        .regex(/^\d{5}$/, { message: 'El código postal debe tener 5 dígitos' })
        .optional()
});
/**
 * Esquema para validar solicitudes de creación/actualización de categoría
 */
exports.categorySchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(100, { message: 'El nombre no puede exceder los 100 caracteres' }),
    padre: zod_1.z.string()
        .regex(/^\d+$/, { message: 'El ID del padre debe ser un número' })
});
/**
 * Esquema para validar solicitudes de creación/actualización de producto
 */
exports.productSchema = zod_1.z.object({
    nombre: zod_1.z.string()
        .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
        .max(100, { message: 'El nombre no puede exceder los 100 caracteres' }),
    descripcion: zod_1.z.string()
        .min(10, { message: 'La descripción debe tener al menos 10 caracteres' }),
    precio: zod_1.z.union([
        zod_1.z.string()
            .regex(/^\d+(\.\d{1,2})?$/, { message: 'El precio debe ser un número con máximo 2 decimales' })
            .transform((val) => parseFloat(val)),
        zod_1.z.number().positive({ message: 'El precio debe ser mayor a 0' })
    ]),
    carpetaimg: zod_1.z.string()
        .min(1, { message: 'Debe proporcionar el nombre de la carpeta de imágenes' })
        .regex(/^[a-zA-Z0-9_-]+$/, { message: 'La carpeta solo puede contener letras, números, guiones y guiones bajos' }),
    imagen: zod_1.z.string()
        .min(1, { message: 'Debe proporcionar el nombre de la imagen principal' }),
    categoria: zod_1.z.union([
        zod_1.z.string()
            .regex(/^\d+$/, { message: 'El ID de la categoría debe ser un número' })
            .transform((val) => parseInt(val)),
        zod_1.z.number().int({ message: 'El ID de la categoría debe ser un número entero' })
    ])
});
/**
 * Esquema para validar solicitudes de creación de color de producto
 */
exports.productColorSchema = zod_1.z.object({
    color: zod_1.z.string()
        .min(1, { message: 'Debe proporcionar el nombre del color' })
        .max(50, { message: 'El nombre del color no puede exceder los 50 caracteres' }),
    imagen: zod_1.z.string()
        .min(1, { message: 'Debe proporcionar el nombre de la imagen' })
});
/**
 * Esquema para validar líneas de pedido
 */
exports.orderLineSchema = zod_1.z.object({
    idprod: zod_1.z.number().int({ message: 'El ID del producto debe ser un número entero' }),
    color: zod_1.z.string().min(1, { message: 'Debe proporcionar el color seleccionado' }),
    cant: zod_1.z.number().int({ message: 'La cantidad debe ser un número entero' })
        .positive({ message: 'La cantidad debe ser mayor a 0' }),
    nombre: zod_1.z.string().optional()
});
/**
 * Esquema para validar solicitudes de creación de pedido
 */
exports.orderSchema = zod_1.z.object({
    iduser: zod_1.z.number().int({ message: 'El ID del usuario debe ser un número entero' }),
    fecha: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'La fecha debe tener formato YYYY-MM-DD' })
        .optional(),
    total: zod_1.z.number()
        .positive({ message: 'El total debe ser mayor a 0' }),
    lineas: zod_1.z.array(exports.orderLineSchema)
        .min(1, { message: 'El pedido debe contener al menos un producto' })
});
/**
 * Middleware para validar solicitudes con Zod
 * @param schema Esquema Zod para validar
 * @returns Middleware de Express
 */
const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.parse(req.body);
            req.body = result; // Reemplazar con datos validados y transformados
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                // Formatear errores de Zod
                const errors = error.issues.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    message: 'Error de validación',
                    errors
                });
            }
            // Error desconocido
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validation-schema.js.map