"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize, dataTypes) {
    /**
     * Clase OrderLine que extiende el Model de Sequelize
     * Implementa la interfaz IOrderLine para tipado fuerte
     */
    class OrderLine extends sequelize_1.Model {
        /**
         * Método estático para definir asociaciones con otros modelos
         * @param models Objeto con todos los modelos disponibles
         */
        static associate(models) {
            // Una línea de pedido pertenece a un pedido
            OrderLine.belongsTo(models.Order, {
                foreignKey: 'idpedido',
                as: 'order'
            });
            // Una línea de pedido está asociada a un producto
            OrderLine.belongsTo(models.Product, {
                foreignKey: 'idprod',
                as: 'product'
            });
        }
    }
    // Inicializar el modelo con sus atributos y opciones
    OrderLine.init({
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        idpedido: {
            type: dataTypes.INTEGER,
            allowNull: false,
            references: { model: 'pedido', key: 'id' },
            comment: 'ID del pedido al que pertenece esta línea'
        },
        idprod: {
            type: dataTypes.INTEGER,
            allowNull: false,
            references: { model: 'producto', key: 'id' },
            comment: 'ID del producto incluido en esta línea'
        },
        color: {
            type: dataTypes.STRING,
            allowNull: false,
            comment: 'Color seleccionado para el producto'
        },
        cant: {
            type: dataTypes.INTEGER,
            allowNull: false,
            validate: { min: 1 },
            comment: 'Cantidad del producto'
        },
        nombre: {
            type: dataTypes.STRING,
            allowNull: true,
            comment: 'Nombre del producto (histórico aunque se modifique el producto)'
        },
        precio: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0,
            comment: 'Precio unitario del producto en la línea'
        }
    }, {
        sequelize,
        modelName: 'OrderLine',
        tableName: 'lineapedido',
        timestamps: false,
        indexes: [
            { fields: ['idpedido'] },
            { fields: ['idprod'] }
        ]
    });
    return OrderLine;
}
exports.default = default_1;
//# sourceMappingURL=order-line.model.js.map