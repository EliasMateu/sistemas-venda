import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Customer } from '@modules/customers/entities/customer.entity';
import { Product } from '@modules/products/entities/product.entity';
import { Sale } from '@modules/sales/entities/sale.entity';
import { User } from '@modules/users/entities/user.entity';
import { ProductCategory } from '@shared/enums';

export interface ImportResult {
  success: number;
  errors: Array<{ row: number; message: string; data?: any }>;
  total: number;
}

// ExcelJS writeBuffer returns its own internal Buffer type.
// Cast via unknown → ArrayBuffer → Node Buffer to satisfy TypeScript.
async function toNodeBuffer(workbook: ExcelJS.Workbook): Promise<Buffer> {
  const raw = await workbook.xlsx.writeBuffer();
  return Buffer.from(raw as unknown as ArrayBuffer);
}

@Injectable()
export class ImportExportService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ─── EXPORT ──────────────────────────────────────────────────────────────────

  async exportCustomers(): Promise<Buffer> {
    const customers = await this.customerRepository.find();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clientes');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Endereço', key: 'address', width: 40 },
      { header: 'Limite de Crédito', key: 'creditLimit', width: 20 },
      { header: 'Criado em', key: 'createdAt', width: 22 },
    ];

    this.styleHeader(sheet);
    customers.forEach((c) => sheet.addRow(c));

    return toNodeBuffer(workbook);
  }

  async exportProducts(): Promise<Buffer> {
    const products = await this.productRepository.find();
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Produtos');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Preço', key: 'price', width: 15 },
      { header: 'Categoria', key: 'category', width: 20 },
    ];

    this.styleHeader(sheet);
    products.forEach((p) => sheet.addRow(p));

    return toNodeBuffer(workbook);
  }

  async exportSales(): Promise<Buffer> {
    const sales = await this.saleRepository.find({
      relations: ['customer', 'product', 'user'],
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Vendas');

    sheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Cliente', key: 'customer', width: 30 },
      { header: 'Produto', key: 'product', width: 30 },
      { header: 'Vendedor', key: 'user', width: 25 },
      { header: 'Quantidade', key: 'quantity', width: 12 },
      { header: 'Valor Total', key: 'totalPrice', width: 15 },
      { header: 'Pago', key: 'paid', width: 8 },
      { header: 'Data Baixa', key: 'dischargeDate', width: 22 },
      { header: 'Criado em', key: 'createdAt', width: 22 },
    ];

    this.styleHeader(sheet);
    sales.forEach((s) =>
      sheet.addRow({
        id: s.id,
        customer: s.customer?.name ?? s.idCustomer,
        product: s.product?.name ?? s.idProduct,
        user: s.user?.name ?? s.idUser,
        quantity: s.quantity,
        totalPrice: s.totalPrice,
        paid: s.paid ? 'Sim' : 'Não',
        dischargeDate: s.dischargeDate,
        createdAt: s.createdAt,
      }),
    );

    return toNodeBuffer(workbook);
  }

  async exportAll(): Promise<Buffer> {
    const [customers, products, sales] = await Promise.all([
      this.customerRepository.find(),
      this.productRepository.find(),
      this.saleRepository.find({ relations: ['customer', 'product', 'user'] }),
    ]);

    const workbook = new ExcelJS.Workbook();

    // Sheet: Clientes
    const csSheet = workbook.addWorksheet('Clientes');
    csSheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Endereço', key: 'address', width: 40 },
      { header: 'Limite de Crédito', key: 'creditLimit', width: 20 },
    ];
    this.styleHeader(csSheet);
    customers.forEach((c) => csSheet.addRow(c));

    // Sheet: Produtos
    const prSheet = workbook.addWorksheet('Produtos');
    prSheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'Preço', key: 'price', width: 15 },
      { header: 'Categoria', key: 'category', width: 20 },
    ];
    this.styleHeader(prSheet);
    products.forEach((p) => prSheet.addRow(p));

    // Sheet: Vendas
    const slSheet = workbook.addWorksheet('Vendas');
    slSheet.columns = [
      { header: 'ID', key: 'id', width: 38 },
      { header: 'Cliente', key: 'customer', width: 30 },
      { header: 'Produto', key: 'product', width: 30 },
      { header: 'Vendedor', key: 'user', width: 25 },
      { header: 'Quantidade', key: 'quantity', width: 12 },
      { header: 'Valor Total', key: 'totalPrice', width: 15 },
      { header: 'Pago', key: 'paid', width: 8 },
      { header: 'Data Baixa', key: 'dischargeDate', width: 22 },
      { header: 'Criado em', key: 'createdAt', width: 22 },
    ];
    this.styleHeader(slSheet);
    sales.forEach((s) =>
      slSheet.addRow({
        id: s.id,
        customer: s.customer?.name ?? s.idCustomer,
        product: s.product?.name ?? s.idProduct,
        user: s.user?.name ?? s.idUser,
        quantity: s.quantity,
        totalPrice: s.totalPrice,
        paid: s.paid ? 'Sim' : 'Não',
        dischargeDate: s.dischargeDate,
        createdAt: s.createdAt,
      }),
    );

    return toNodeBuffer(workbook);
  }

  // ─── IMPORT ──────────────────────────────────────────────────────────────────

  async importCustomers(buffer: Buffer): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer.buffer as ArrayBuffer);
    const sheet = workbook.getWorksheet(1);
    if (!sheet) throw new BadRequestException('Planilha inválida');

    const result: ImportResult = { success: 0, errors: [], total: 0 };
    const rows: ExcelJS.Row[] = [];
    sheet.eachRow((row, idx) => { if (idx > 1) rows.push(row); });
    result.total = rows.length;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      try {
        const name = String(row.getCell(2).value ?? '').trim();
        if (!name) {
          result.errors.push({ row: rowNum, message: 'Nome é obrigatório' });
          continue;
        }

        const existing = await this.customerRepository.findOne({ where: { name } });
        if (existing) {
          result.errors.push({ row: rowNum, message: `Cliente "${name}" já existe`, data: { name } });
          continue;
        }

        await this.customerRepository.save(
          this.customerRepository.create({
            name,
            phone: String(row.getCell(3).value ?? '').trim() || null,
            address: String(row.getCell(4).value ?? '').trim() || null,
            creditLimit: parseFloat(String(row.getCell(5).value ?? '0')) || null,
          }),
        );
        result.success++;
      } catch (err) {
        result.errors.push({ row: rowNum, message: err.message });
      }
    }

    return result;
  }

  async importProducts(buffer: Buffer): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer.buffer as ArrayBuffer);
    const sheet = workbook.getWorksheet(1);
    if (!sheet) throw new BadRequestException('Planilha inválida');

    const result: ImportResult = { success: 0, errors: [], total: 0 };
    const rows: ExcelJS.Row[] = [];
    sheet.eachRow((row, idx) => { if (idx > 1) rows.push(row); });
    result.total = rows.length;

    const validCategories = Object.values(ProductCategory) as string[];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      try {
        const name = String(row.getCell(2).value ?? '').trim();
        const price = parseFloat(String(row.getCell(3).value ?? '0'));
        const category = String(row.getCell(4).value ?? '').trim();

        if (!name) {
          result.errors.push({ row: rowNum, message: 'Nome é obrigatório' });
          continue;
        }
        if (!validCategories.includes(category)) {
          result.errors.push({ row: rowNum, message: `Categoria "${category}" inválida. Use: ${validCategories.join(', ')}` });
          continue;
        }

        await this.productRepository.save(
          this.productRepository.create({ name, price, category: category as ProductCategory }),
        );
        result.success++;
      } catch (err) {
        result.errors.push({ row: rowNum, message: err.message });
      }
    }

    return result;
  }

  // ─── TEMPLATE DOWNLOAD ───────────────────────────────────────────────────────

  async getCustomerTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clientes');
    sheet.columns = [
      { header: 'ID (deixar vazio)', key: 'id', width: 22 },
      { header: 'Nome *', key: 'name', width: 30 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Endereço', key: 'address', width: 40 },
      { header: 'Limite de Crédito', key: 'creditLimit', width: 20 },
    ];
    this.styleHeader(sheet);
    sheet.addRow({ id: '', name: 'João da Silva', phone: '(11) 99999-0000', address: 'Rua Exemplo, 123', creditLimit: 500 });
    return toNodeBuffer(workbook);
  }

  async getProductTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Produtos');
    sheet.columns = [
      { header: 'ID (deixar vazio)', key: 'id', width: 22 },
      { header: 'Nome *', key: 'name', width: 30 },
      { header: 'Preço *', key: 'price', width: 15 },
      { header: `Categoria * (${Object.values(ProductCategory).join(' | ')})`, key: 'category', width: 80 },
    ];
    this.styleHeader(sheet);
    sheet.addRow({ id: '', name: 'Produto Exemplo', price: 29.90, category: ProductCategory.OUTROS });
    return toNodeBuffer(workbook);
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────────

  private styleHeader(sheet: ExcelJS.Worksheet) {
    const header = sheet.getRow(1);
    header.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    header.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
    header.alignment = { vertical: 'middle', horizontal: 'center' };
    header.height = 22;
  }
}
