"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Rutas de Productos
 * Define los endpoints de la API para productos
 */
const express_1 = require("express");
const product_controller_1 = __importDefault(require("../controllers/product.controller"));
const router = (0, express_1.Router)();
// ⚠️ ORDEN CRÍTICO: Las rutas específicas deben ir ANTES de las rutas con parámetros
// 🔍 Búsqueda de productos (debe ir PRIMERO)
router.get('/search', product_controller_1.default.search.bind(product_controller_1.default));
// 📦 Productos por categoría (específico antes de :id)
router.get('/categoria/:categoryId', product_controller_1.default.getProductsByCategory.bind(product_controller_1.default));
// 🎨 Colores de un producto específico
router.get('/:id/colors', product_controller_1.default.getColors.bind(product_controller_1.default));
// 🖼️ Imagen de producto
router.get('/image/:categoria/:imagen', product_controller_1.default.getImage.bind(product_controller_1.default));
// 📋 CRUD básico
router.get('/', product_controller_1.default.index.bind(product_controller_1.default));
router.post('/', product_controller_1.default.store.bind(product_controller_1.default));
// ⚠️ Rutas con :id deben ir AL FINAL para evitar conflictos
router.get('/:id', product_controller_1.default.show.bind(product_controller_1.default));
router.put('/:id', product_controller_1.default.update.bind(product_controller_1.default));
router.delete('/:id', product_controller_1.default.destroy.bind(product_controller_1.default));
exports.default = router;
//# sourceMappingURL=product.routes.js.map