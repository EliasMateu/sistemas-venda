import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from '@modules/sales/entities/sale.entity';
import { Customer } from '@modules/customers/entities/customer.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async getSummary() {
    const [totalDischarge, totalDebt, totalSales, topDebtors, monthlySales] =
      await Promise.all([
        this.getTotalDischarge(),
        this.getTotalDebt(),
        this.getTotalSalesCount(),
        this.getTopDebtors(10),
        this.getMonthlySales(),
      ]);

    return {
      totalDischarge,
      totalDebt,
      totalSales,
      topDebtors,
      monthlySales,
    };
  }

  async getTopDebtors(limit = 10) {
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.sales', 'sale', 'sale.paid = :paid', { paid: false })
      .getMany();

    return customers
      .map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        creditLimit: Number(c.creditLimit) || null,
        totalDebt: c.sales.reduce((sum, s) => sum + Number(s.totalPrice), 0),
        salesCount: c.sales.length,
        isOverLimit:
          c.creditLimit &&
          c.sales.reduce((sum, s) => sum + Number(s.totalPrice), 0) >
            Number(c.creditLimit),
      }))
      .filter((c) => c.totalDebt > 0)
      .sort((a, b) => b.totalDebt - a.totalDebt)
      .slice(0, limit);
  }

  async getTotalDischarge(): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalPrice)', 'total')
      .where('sale.paid = :paid', { paid: true })
      .getRawOne();
    return parseFloat(result?.total) || 0;
  }

  async getTotalDebt(): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalPrice)', 'total')
      .where('sale.paid = :paid', { paid: false })
      .getRawOne();
    return parseFloat(result?.total) || 0;
  }

  async getTotalSalesCount(): Promise<number> {
    return this.saleRepository.count();
  }

  async getMonthlySales() {
    const sales = await this.saleRepository.find({
      order: { createdAt: 'DESC' },
    });

    const monthlyMap: Record<string, { total: number; count: number; paid: number }> = {};

    sales.forEach((sale) => {
      const key = new Date(sale.createdAt).toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyMap[key]) monthlyMap[key] = { total: 0, count: 0, paid: 0 };
      monthlyMap[key].total += Number(sale.totalPrice);
      monthlyMap[key].count += 1;
      if (sale.paid) monthlyMap[key].paid += Number(sale.totalPrice);
    });

    return Object.entries(monthlyMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, data]) => ({ month, ...data }));
  }
}
