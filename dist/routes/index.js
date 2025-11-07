"use strict";
// ===============================
// src/routes/index.ts - Rutas principales actualizadas
// ===============================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("./user.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const order_routes_1 = __importDefault(require("./order.routes")); // ✅ Descomentado
// Crear un router para todas las rutas
const router = (0, express_1.Router)();
// ✅ Registrar todas las rutas por dominio
router.use('/users', user_routes_1.default);
router.use('/categorias', category_routes_1.default);
router.use('/productos', product_routes_1.default);
router.use('/pedidos', order_routes_1.default); // ✅ Habilitado y corregido el nombre
// ✅ Ruta de health check
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
// ✅ Ruta para obtener información de la API
router.get('/info', (req, res) => {
    res.status(200).json({
        name: 'TatooDenda API',
        version: '1.0.0',
        description: 'API para la tienda online de tatuajes y piercings',
        endpoints: {
            users: '/api/users',
            categories: '/api/categorias',
            products: '/api/productos',
            orders: '/api/pedidos'
        }
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map