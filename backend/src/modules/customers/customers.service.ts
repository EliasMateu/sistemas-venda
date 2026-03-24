import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dtos/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(dto: CreateCustomerDto): Promise<Customer> {
    await this.ensureNameUnique(dto.name);
    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customerRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['sales', 'sales.product'],
    });
    if (!customer) throw new NotFoundException('Cliente não encontrado');
    return customer;
  }

  async findWithDebt(): Promise<any[]> {
    const customers = await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.sales', 'sale')
      .leftJoinAndSelect('sale.product', 'product')
      .getMany();

    return customers.map((customer) => {
      const totalDebt = customer.sales
        .filter((s) => !s.paid)
        .reduce((sum, s) => sum + Number(s.totalPrice), 0);

      const totalPaid = customer.sales
        .filter((s) => s.paid)
        .reduce((sum, s) => sum + Number(s.totalPrice), 0);

      const isOverLimit =
        customer.creditLimit && totalDebt > Number(customer.creditLimit);

      return {
        ...customer,
        totalDebt,
        totalPaid,
        isOverLimit,
      };
    });
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (dto.name && dto.name !== customer.name) {
      await this.ensureNameUnique(dto.name);
    }

    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async setGlobalCreditLimit(limit: number): Promise<void> {
    await this.customerRepository
      .createQueryBuilder()
      .update(Customer)
      .set({ creditLimit: limit })
      .where('creditLimit IS NULL')
      .execute();
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.remove(customer);
  }

  private async ensureNameUnique(name: string): Promise<void> {
    const existing = await this.customerRepository.findOne({ where: { name } });
    if (existing) throw new ConflictException('Cliente já cadastrado com este nome');
  }
}
