import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IProduct } from '../interfaces/product.interface';
interface ProductModel extends Model<IProduct>, IProduct {
    associate?: (models: any) => void;
}
export default function (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<ProductModel>;
export {};
