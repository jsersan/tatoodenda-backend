"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
// Definir un tipo de retorno explícito para la función
function default_1(sequelize, dataTypes) {
    class Category extends sequelize_1.Model {
        /**
         * Método estático para definir asociaciones con otros modelos
         * @param models Objeto con todos los modelos disponibles
         */
        static associate(models) {
            // Una categoría puede tener muchos productos
            Category.hasMany(models.Product, {
                foreignKey: 'categoria',
                as: 'products'
            });
            // Relación con categoría padre (autoreferencial)
            Category.belongsTo(Category, {
                foreignKey: 'padre',
                as: 'parentCategory'
            });
            // Relación con categorías hijas (autoreferencial)
            Category.hasMany(Category, {
                foreignKey: 'padre',
                as: 'childCategories'
            });
        }
    }
    // Inicializar el modelo con sus atributos y opciones
    Category.init({
        // Definición de columnas
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        padre: {
            type: dataTypes.INTEGER,
            allowNull: false,
            defaultValue: -1,
            comment: 'ID de la categoría padre. Si es principal, debe ser igual a su propio ID'
        }
    }, {
        sequelize,
        modelName: 'Category',
        tableName: 'categoria',
        timestamps: false,
        // Hooks (ganchos) para operaciones automáticas
        hooks: {
            // Después de crear, si es categoría principal, establecer padre=id
            afterCreate: async (category) => {
                if (category.padre === -1) {
                    await category.update({ padre: category.id });
                }
            }
        }
    });
    return Category;
}
exports.default = default_1;
//# sourceMappingURL=category.model.js.map