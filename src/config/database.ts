import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import config from './environment';
import path from 'path';

const typeOrmConfig: PostgresConnectionOptions = {
  type: 'postgres',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  schema: config.database.schema,
  synchronize: false, // No sincronizar - ya tenemos una base de datos existente
  migrationsRun: false,
  logging: config.env === 'development',
  entities: [path.join(__dirname, '../models/**/*.{js,ts}')],
  migrations: [path.join(__dirname, '../migrations/**/*.{js,ts}')],
  ssl: config.env === 'production',
};

const AppDataSource = new DataSource(typeOrmConfig);

export { AppDataSource, typeOrmConfig };