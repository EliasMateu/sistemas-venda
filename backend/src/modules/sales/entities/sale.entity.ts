import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from '@modules/customers/entities/customer.entity';
import { User } from '@modules/users/entities/user.entity';
import { Product } from '@modules/products/entities/product.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  idCustomer: string;

  @Column()
  idUser: string;

  @Column()
  idProduct: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @Column({ nullable: true })
  dischargeDate: Date;

  @Column({ default: false })
  paid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Customer, (customer) => customer.sales, { eager: false })
  @JoinColumn({ name: 'idCustomer' })
  customer: Customer;

  @ManyToOne(() => User, (user) => user.sales, { eager: false })
  @JoinColumn({ name: 'idUser' })
  user: User;

  @ManyToOne(() => Product, (product) => product.sales, { eager: false })
  @JoinColumn({ name: 'idProduct' })
  product: Product;
}
