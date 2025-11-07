"use strict";
// backend/services/order.service.ts - VERSIÓN CORREGIDA
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const models_1 = __importDefault(require("../models"));
class OrderService {
    // Crear pedido con líneas incluidas (CORREGIDO - ahora guarda el precio en cada línea)
    async createOrder(orderData) {
        console.log("📦 CREAR PEDIDO - Datos recibidos:", JSON.stringify(orderData, null, 2));
        // ✅ CRÍTICO: Asegurar que cada línea tenga el campo precio
        if (orderData.lineas && Array.isArray(orderData.lineas)) {
            orderData.lineas = orderData.lineas.map((linea) => {
                // Si la línea tiene precio, usarlo; si no, calcularlo o ponerlo en 0
                const precioFinal = linea.precio !== undefined && linea.precio !== null
                    ? Number(linea.precio)
                    : 0;
                console.log(`   Línea: ${linea.nombre} - Precio: ${precioFinal}`);
                return Object.assign(Object.assign({}, linea), { precio: precioFinal // ✅ Asegurar que precio está presente
                 });
            });
        }
        console.log("📦 Líneas procesadas con precios:", JSON.stringify(orderData.lineas, null, 2));
        // Crear el pedido con las líneas
        const pedido = await models_1.default.Order.create(orderData, {
            include: [{ model: models_1.default.OrderLine, as: 'lineas' }]
        });
        console.log("✅ PEDIDO CREADO con ID:", pedido.id);
        return pedido;
    }
    // Consultar pedidos de usuario, incluyendo líneas
    async getOrdersByUserWithLines(userId) {
        const orders = await models_1.default.Order.findAll({
            where: { iduser: userId },
            include: [{ model: models_1.default.OrderLine, as: 'lineas' }],
            order: [['fecha', 'DESC'], ['id', 'DESC']] // Más recientes primero
        });
        return orders.map((o) => o.get({ plain: true }));
    }
    // Consultar por ID incluyendo líneas
    async getOrderByIdWithLines(orderId) {
        const order = await models_1.default.Order.findByPk(orderId, {
            include: [{ model: models_1.default.OrderLine, as: 'lineas' }]
        });
        return order ? order.get({ plain: true }) : null;
    }
    // Consultar líneas específicas separadas
    async getOrderLines(orderId) {
        const lines = await models_1.default.OrderLine.findAll({
            where: { idpedido: orderId }
        });
        return lines.map((l) => l.get({ plain: true }));
    }
    // Consultar usuario (opcional, si tu código lo usa)
    async getUserData(userId) {
        const user = await models_1.default.User.findByPk(userId);
        return user ? user.get({ plain: true }) : null;
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=order.service.js.map