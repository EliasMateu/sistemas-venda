import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sale } from '@modules/sales/entities/sale.entity';
import { Customer } from '@modules/customers/entities/customer.entity';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Sale, Customer])],
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
