import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateSaleDto {
  @IsUUID()
  idCustomer: string;

  @IsUUID()
  idProduct: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  totalPrice: number;

  @IsDateString()
  @IsOptional()
  dischargeDate?: Date;

  @IsBoolean()
  @IsOptional()
  paid?: boolean;
}

export class UpdateSaleDto {
  @IsUUID()
  @IsOptional()
  idCustomer?: string;

  @IsUUID()
  @IsOptional()
  idProduct?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  totalPrice?: number;

  @IsDateString()
  @IsOptional()
  dischargeDate?: Date;

  @IsBoolean()
  @IsOptional()
  paid?: boolean;
}
