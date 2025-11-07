import { Model, DataTypes, Sequelize, ModelStatic } from 'sequelize';
import { IUser } from '../interfaces/user.interface';
export default function (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelStatic<Model<IUser>>;
