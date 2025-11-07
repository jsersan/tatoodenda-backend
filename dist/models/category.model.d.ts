import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { ICategory } from '../interfaces/category.interface';
export default function (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<ICategory>>;
