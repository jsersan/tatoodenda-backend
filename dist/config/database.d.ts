import { Dialect } from 'sequelize';
interface DbConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    dialect: Dialect;
    pool: {
        max: number;
        min: number;
        acquire: number;
        idle: number;
    };
    dialectOptions?: {
        connectTimeout?: number;
        ssl?: {
            require: boolean;
            rejectUnauthorized: boolean;
        };
    };
}
declare const config: DbConfig;
declare const sequelize: any;
declare const stopConnectionCheck: () => void;
declare const initializeDatabase: (retries?: number, delay?: number) => Promise<boolean>;
export default config;
export { sequelize, initializeDatabase, stopConnectionCheck };
