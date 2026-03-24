import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../src/modules/users/entities/user.entity';
import { UserRole, UserType } from '../src/shared/enums';
import { Customer } from '../src/modules/customers/entities/customer.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { Sale } from '../src/modules/sales/entities/sale.entity';

import 'dotenv/config';

const dbType = process.env.DATABASE_TYPE || 'sqlite';

const AppDataSource = new DataSource(
  dbType === 'sqlite'
    ? {
        type: 'sqlite',
        database: process.env.DATABASE_PATH || './database.sqlite',
        entities: [User, Customer, Product, Sale],
        synchronize: true,
      }
    : dbType === 'mysql'
    ? {
        type: 'mysql',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '3306'),
        username: process.env.DATABASE_USER || 'root',
        password: process.env.DATABASE_PASS || 'root',
        database: process.env.DATABASE_NAME || 'vendas_db',
        entities: [User, Customer, Product, Sale],
        synchronize: true,
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASS || 'password',
        database: process.env.DATABASE_NAME || 'vendas_db',
        entities: [User, Customer, Product, Sale],
        synchronize: true,
      }
);

async function seed() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);

  const exists = await repo.findOne({ where: { email: 'admin@sistema.com' } });
  if (exists) {
    console.log('✅ Admin já existe');
    return;
  }

  const admin = repo.create({
    name: 'Administrador',
    email: 'admin@sistema.com',
    password: await bcrypt.hash('admin123', 10),
    role: UserRole.ADMIN,
    type: UserType.NON_SELLER,
  });

  await repo.save(admin);
  console.log('✅ Admin criado: admin@sistema.com / admin123');
  await AppDataSource.destroy();
}

seed().catch(console.error);
