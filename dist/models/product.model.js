"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize, dataTypes) {
    /**
     * Clase Product extendida para incluir métodos virtuales
     */
    class Product extends sequelize_1.Model {
        /**
         * Override del método toJSON para incluir carpetaimg automáticamente
         */
        toJSON() {
            const values = Object.assign({}, this.get());
            // Mapear la categoría a carpetaimg
            if (values.categoria) {
                values.carpetaimg = this.getCarpetaImg();
                // Asignar categoria_id para mantener compatibilidad con la interfaz
                values.categoria_id = values.categoria;
            }
            return values;
        }
        /**
         * Método para obtener el nombre de carpeta de imagen según la categoría
         */
        getCarpetaImg() {
            const categoryMap = {
                1: 'anillo',
                2: 'barbell',
                3: 'tuneles',
                4: 'plug',
                5: 'expander',
                6: 'banana',
                7: 'labret',
                8: 'barbell',
                9: 'circular-barbel',
                10: 'anillo',
                11: 'piercing',
                12: 'dilataciones'
            };
            const categoria = this.get('categoria');
            return categoryMap[categoria] || 'default';
        }
    }
    /**
     * Definir el modelo Product con sus atributos
     */
    const ProductModel = Product.init({
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
        },
        nombre: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'El nombre es requerido'
                },
                notEmpty: {
                    msg: 'El nombre no puede estar vacío'
                }
            }
        },
        descripcion: {
            type: dataTypes.TEXT,
            allowNull: true,
        },
        precio: {
            type: dataTypes.DECIMAL(10, 2),
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'El precio es requerido'
                },
                isDecimal: {
                    msg: 'El precio debe ser un número decimal'
                },
                min: {
                    args: [0],
                    msg: 'El precio no puede ser negativo'
                }
            }
        },
        categoria_id: {
            type: dataTypes.INTEGER,
            field: 'categoria',
            allowNull: false,
            validate: {
                notNull: {
                    msg: 'La categoría es requerida'
                }
            }
        },
        imagen: {
            type: dataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'Product',
        tableName: 'producto',
        timestamps: false,
        underscored: false,
        paranoid: false,
        freezeTableName: true,
    });
    /**
     * Definir asociaciones del modelo Product
     */
    ProductModel.associate = (models) => {
        ProductModel.belongsTo(models.Category, {
            foreignKey: 'categoria',
            as: 'categoryInfo' // Cambiado a 'categoryInfo' para evitar colisión
        });
    };
    return ProductModel;
}
exports.default = default_1;
//# sourceMappingURL=product.model.js.map