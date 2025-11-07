import { Model, DataTypes, Sequelize, ModelStatic, Optional } from 'sequelize';
import { IOrderLine } from '../interfaces/order.interface';
interface OrderLineCreationAttributes extends Optional<IOrderLine, 'id'> {
}
export default function (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<IOrderLine, OrderLineCreationAttributes>>;
export {};
