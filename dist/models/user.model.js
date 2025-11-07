"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
function default_1(sequelize, dataTypes) {
    /**
     * Clase User que extiende el Model de Sequelize
     * Implementa la interfaz IUser para tipado fuerte
     */
    class User extends sequelize_1.Model {
        /**
         * Método estático para definir asociaciones con otros modelos
         * @param models Objeto con todos los modelos disponibles
         */
        static associate(models) {
            // Un usuario puede tener muchos pedidos
            User.hasMany(models.Order, {
                foreignKey: 'iduser',
                as: 'orders'
            });
        }
    }
    // Inicializar el modelo con sus atributos y opciones
    User.init({
        // Definición de columnas
        id: {
            type: dataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        username: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                notEmpty: true,
                len: [3, 30] // Longitud mínima y máxima
            }
        },
        password: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        nombre: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },
        email: {
            type: dataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true // Validar formato de email
            }
        },
        direccion: {
            type: dataTypes.STRING,
            allowNull: false
        },
        ciudad: {
            type: dataTypes.STRING,
            allowNull: false
        },
        cp: {
            type: dataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\d{5}$/ // Validar formato de código postal (5 dígitos)
            }
        },
        role: {
            type: dataTypes.STRING,
            defaultValue: 'user',
            validate: {
                isIn: [['user', 'admin']] // Validar que solo sean estos valores
            }
        }
    }, {
        sequelize,
        modelName: 'User',
        timestamps: false,
        tableName: 'user' // Cambiado de 'users' a 'user'
    });
    return User;
}
exports.default = default_1;
//# sourceMappingURL=user.model.js.map