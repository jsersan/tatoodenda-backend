import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IColor } from '../interfaces/color.interface';
export default function (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<IColor>>;
