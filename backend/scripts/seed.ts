import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../src/modules/users/entities/user.entity';
import { UserRole, UserType } from '../src/shared/enums';
import { Customer } from '../src/modules/customers/entities/customer.entity';
import { Product } from '../src/modules/products/entities/product.entity';
import { Sale } from '../src/modules/sales/entities/sale.entity';

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './database.sqlite',
  entities: [User, Customer, Product, Sale],
  synchronize: true,
});

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
