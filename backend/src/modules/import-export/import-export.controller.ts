import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Res,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { ImportExportService } from './import-export.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('import-export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('import-export')
export class ImportExportController {
  constructor(private readonly importExportService: ImportExportService) {}

  // ─── EXPORT ────────────────────────────────────────────────────────────────

  @Get('export/all')
  async exportAll(@Res() res: Response) {
    const buffer = await this.importExportService.exportAll();
    this.sendExcel(res, buffer, 'dados-completos.xlsx');
  }

  @Get('export/customers')
  async exportCustomers(@Res() res: Response) {
    const buffer = await this.importExportService.exportCustomers();
    this.sendExcel(res, buffer, 'clientes.xlsx');
  }

  @Get('export/products')
  async exportProducts(@Res() res: Response) {
    const buffer = await this.importExportService.exportProducts();
    this.sendExcel(res, buffer, 'produtos.xlsx');
  }

  @Get('export/sales')
  async exportSales(@Res() res: Response) {
    const buffer = await this.importExportService.exportSales();
    this.sendExcel(res, buffer, 'vendas.xlsx');
  }

  // ─── TEMPLATES ─────────────────────────────────────────────────────────────

  @Get('template/customers')
  async customerTemplate(@Res() res: Response) {
    const buffer = await this.importExportService.getCustomerTemplate();
    this.sendExcel(res, buffer, 'template-clientes.xlsx');
  }

  @Get('template/products')
  async productTemplate(@Res() res: Response) {
    const buffer = await this.importExportService.getProductTemplate();
    this.sendExcel(res, buffer, 'template-produtos.xlsx');
  }

  // ─── IMPORT ────────────────────────────────────────────────────────────────

  @Post('import/customers')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importCustomers(@UploadedFile() file: Express.Multer.File) {
    return this.importExportService.importCustomers(file.buffer);
  }

  @Post('import/products')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async importProducts(@UploadedFile() file: Express.Multer.File) {
    return this.importExportService.importProducts(file.buffer);
  }

  // ─── HELPERS ───────────────────────────────────────────────────────────────

  private sendExcel(res: Response, buffer: Buffer, filename: string) {
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
