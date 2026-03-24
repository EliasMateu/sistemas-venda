import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '@modules/customers/entities/customer.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Sale } from '@modules/sales/entities/sale.entity';
import { User } from '@modules/users/entities/user.entity';
import { ImportExportService } from './import-export.service';
import { ImportExportController } from './import-export.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Product, Sale, User])],
  providers: [ImportExportService],
  controllers: [ImportExportController],
})
export class ImportExportModule {}
