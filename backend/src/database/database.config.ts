import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (config: ConfigService): TypeOrmModuleOptions => {
  const dbType = config.get('DATABASE_TYPE', 'sqlite');

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      database: config.get('DATABASE_PATH', './database.sqlite'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    };
  }

  if (dbType === 'mysql') {
    return {
      type: 'mysql',
      host: config.get('DATABASE_HOST', 'localhost'),
      port: parseInt(config.get('DATABASE_PORT', '3306')),
      username: config.get('DATABASE_USER', 'root'),
      password: config.get('DATABASE_PASS', 'root'),
      database: config.get('DATABASE_NAME', 'vendas_db'),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    };
  }

  return {
    type: 'postgres',
    host: config.get('DATABASE_HOST', 'localhost'),
    port: parseInt(config.get('DATABASE_PORT', '5432')),
    username: config.get('DATABASE_USER', 'postgres'),
    password: config.get('DATABASE_PASS', 'password'),
    database: config.get('DATABASE_NAME', 'vendas_db'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  };
};
