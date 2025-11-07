"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const router = (0, express_1.Router)();
// Obtener todos los pedidos de un usuario
router.get('/user/:userId', order_controller_1.OrderController.getUserOrders);
// Descargar albarÃ¡n PDF de un pedido concreto (GET por id)
router.get('/albaran/:pedidoId', order_controller_1.OrderController.descargarAlbaran);
// Crear nuevo pedido (y enviar albarÃ¡n por email)
router.post('/', order_controller_1.OrderController.createOrder);
// Reenviar albarÃ¡n por email
router.post('/reenviar-albaran/:pedidoId', order_controller_1.OrderController.reenviarAlbaran);
exports.default = router;
//# sourceMappingURL=order.routes.js.map