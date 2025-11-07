"use strict";
/* Rutas de Categoría
 * Define endpoints para gestión de categorías */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_controller_1 = __importDefault(require("../controllers/category.controller"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const admin_middleware_1 = require("../middleware/admin.middleware");
// Crear un router para las rutas de categoría
const router = (0, express_1.Router)();
// Rutas públicas (no requieren autenticación)
/* GET /api/categorias
 * Obtiene todas las categorías */
router.get('/', category_controller_1.default.findAll);
/* GET /api/categorias/:id
 * Obtiene una categoría específica por ID */
router.get('/:id', category_controller_1.default.findOne);
// Rutas administrativas (requieren autenticación y permisos de admin)
/* POST /api/categorias
 * Crea una nueva categoría */
router.post('/', [auth_middleware_1.verifyToken, admin_middleware_1.isAdmin], category_controller_1.default.create);
/* PUT /api/categorias/:id
 * Actualiza una categoría existente */
router.put('/:id', [auth_middleware_1.verifyToken, admin_middleware_1.isAdmin], category_controller_1.default.update);
/* DELETE /api/categorias/:id
 * Elimina una categoría */
router.delete('/:id', [auth_middleware_1.verifyToken, admin_middleware_1.isAdmin], category_controller_1.default.delete);
exports.default = router;
//# sourceMappingURL=category.routes.js.map