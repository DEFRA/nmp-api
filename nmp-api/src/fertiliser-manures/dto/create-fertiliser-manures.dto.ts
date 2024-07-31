import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDate,
  IsDecimal,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CreateFertiliserManuresDto {
  @ApiProperty()
  @IsNumber()
  ManagementPeriodID: number;

  @ApiProperty({ type: 'string', format: 'date-time' })
  @IsDate()
  ApplicationDate: Date;

  @ApiProperty()
  @IsNumber()
  ApplicationRate: number;

  @ApiProperty({ type: Boolean, nullable: true })
  @IsOptional()
  @IsBoolean()
  Confirm?: boolean;

  @ApiProperty()
  @IsDecimal()
  N: number;

  @ApiProperty()
  @IsDecimal()
  P2O5: number;

  @ApiProperty()
  @IsDecimal()
  K2O: number;

  @ApiProperty()
  @IsDecimal()
  MgO: number;

  @ApiProperty()
  @IsDecimal()
  SO3: number;

  @ApiProperty()
  @IsDecimal()
  Na2O: number;

  @ApiProperty()
  @IsDecimal()
  NFertAnalysisPercent: number;

  @ApiProperty()
  @IsDecimal()
  P2O5FertAnalysisPercent: number;

  @ApiProperty()
  @IsDecimal()
  K2OFertAnalysisPercent: number;

  @ApiProperty()
  @IsDecimal()
  MgOFertAnalysisPercent: number;

  @ApiProperty()
  @IsDecimal()
  SO3FertAnalysisPercent: number;

  @ApiProperty()
  @IsDecimal()
  Na2OFertAnalysisPercent: number;

  @ApiProperty()
  @IsDecimal()
  Lime: number;

  @ApiProperty()
  @IsDecimal()
  NH4N: number;

  @ApiProperty()
  @IsDecimal()
  NO3N: number;

  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  @IsOptional()
  @IsDate()
  CreatedOn?: Date;

  @ApiProperty({ nullable: true })
  @IsOptional()
  @IsNumber()
  CreatedByID?: number;

  @ApiProperty({ default: () => new Date() })
  @IsOptional()
  @IsDate()
  ModifiedOn?: Date;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsNumber()
  ModifiedByID?: number;
}
