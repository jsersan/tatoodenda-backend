"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(sequelize, dataTypes) {
    const Color = sequelize.define('Color', {
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: dataTypes.STRING,
            allowNull: false,
        },
        codigo_color: {
            type: dataTypes.STRING,
            allowNull: true,
        }
    }, {
        modelName: 'Color',
        tableName: 'colors',
        timestamps: true,
        underscored: false,
        paranoid: false,
        freezeTableName: true,
    });
    Color.associate = function (models) {
        if (models.ProductColor && models.Product) {
            // Un color puede estar asociado a muchos productos
            Color.belongsToMany(models.Product, {
                through: models.ProductColor,
                foreignKey: 'color_id',
                otherKey: 'product_id',
                as: 'products'
            });
        }
    };
    return Color;
}
exports.default = default_1;
//# sourceMappingURL=color.model.js.map