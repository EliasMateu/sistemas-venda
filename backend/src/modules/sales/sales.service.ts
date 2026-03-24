import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { CreateSaleDto, UpdateSaleDto } from './dtos/sale.dto';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async create(dto: CreateSaleDto, userId: string): Promise<Sale> {
    const sale = this.saleRepository.create({ ...dto, idUser: userId });
    return this.saleRepository.save(sale);
  }

  async findAll(): Promise<Sale[]> {
    return this.saleRepository.find({
      relations: ['customer', 'user', 'product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.saleRepository.findOne({
      where: { id },
      relations: ['customer', 'user', 'product'],
    });
    if (!sale) throw new NotFoundException('Venda não encontrada');
    return sale;
  }

  async findByCustomer(customerId: string): Promise<Sale[]> {
    return this.saleRepository.find({
      where: { idCustomer: customerId },
      relations: ['product', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, dto: UpdateSaleDto): Promise<Sale> {
    const sale = await this.findOne(id);
    Object.assign(sale, dto);
    return this.saleRepository.save(sale);
  }

  async markAsPaid(id: string): Promise<Sale> {
    const sale = await this.findOne(id);
    sale.paid = true;
    sale.dischargeDate = new Date();
    return this.saleRepository.save(sale);
  }

  async remove(id: string): Promise<void> {
    const sale = await this.findOne(id);
    await this.saleRepository.remove(sale);
  }

  async getTotalDischarge(): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalPrice)', 'total')
      .where('sale.paid = :paid', { paid: true })
      .getRawOne();
    return parseFloat(result.total) || 0;
  }

  async getTotalDebt(): Promise<number> {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalPrice)', 'total')
      .where('sale.paid = :paid', { paid: false })
      .getRawOne();
    return parseFloat(result.total) || 0;
  }
}
