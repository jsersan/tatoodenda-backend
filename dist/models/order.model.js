"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize, dataTypes) {
    class Order extends sequelize_1.Model {
        static associate(models) {
            // Asociación con el usuario
            Order.belongsTo(models.User, {
                foreignKey: 'iduser',
                as: 'user'
            });
            // Asociación con las líneas del pedido
            Order.hasMany(models.OrderLine, {
                foreignKey: 'idpedido',
                as: 'lineas',
                onDelete: 'CASCADE'
            });
        }
    }
    Order.init({
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        iduser: {
            type: dataTypes.INTEGER,
            allowNull: false,
            references: { model: 'users', key: 'id' },
            comment: 'ID del usuario que realizó el pedido'
        },
        fecha: {
            type: dataTypes.DATEONLY,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
            comment: 'Fecha en que se realizó el pedido'
        },
        total: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: { min: 0 },
            comment: 'Importe total del pedido'
        }
    }, {
        sequelize,
        modelName: 'Order',
        tableName: 'pedido',
        timestamps: false,
        indexes: [
            { fields: ['iduser'] },
            { fields: ['fecha'] }
        ]
    });
    return Order;
}
exports.default = default_1;
//# sourceMappingURL=order.model.js.map