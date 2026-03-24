import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from '@database/database.config';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { CustomersModule } from '@modules/customers/customers.module';
import { ProductsModule } from '@modules/products/products.module';
import { SalesModule } from '@modules/sales/sales.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
import { ImportExportModule } from '@modules/import-export/import-export.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => getDatabaseConfig(config),
    }),
    AuthModule,
    UsersModule,
    CustomersModule,
    ProductsModule,
    SalesModule,
    DashboardModule,
    ImportExportModule,
  ],
})
export class AppModule {}
