import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsBoolean,
  IsArray,
  IsDateString,
  IsNumber,
  ValidateNested,
} from 'class-validator';

class FieldDto {
  @ApiProperty({ description: 'ID of the field' })
  @IsInt()
  fieldID: number;

  @ApiProperty({ description: 'Name of the field' })
  @IsString()
  fieldName: string;

  @ApiProperty({ description: 'ID of the crop type' })
  @IsInt()
  MannerCropTypeID: number;

  @ApiProperty({ description: 'ID of the topsoil type' })
  @IsInt()
  topsoilID: number;

  @ApiProperty({ description: 'ID of the subsoil type' })
  @IsInt()
  subsoilID: number;

  @ApiProperty({ description: 'Indicates if the field is in NVZ' })
  @IsBoolean()
  isInNVZ: boolean;
}

class ManureDetailsDto {
  @ApiProperty({ description: 'ID of the manure' })
  @IsInt()
  manureID: number;

  @ApiProperty({ description: 'Name of the manure' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Indicates if the manure is liquid' })
  @IsBoolean()
  isLiquid: boolean;

  @ApiProperty({ description: 'Dry matter percentage of the manure' })
  @IsNumber()
  dryMatter: number;

  @ApiProperty({ description: 'Total nitrogen in the manure' })
  @IsNumber()
  totalN: number;

  @ApiProperty({ description: 'NH4N content in the manure' })
  @IsNumber()
  nH4N: number;

  @ApiProperty({ description: 'Uric acid content in the manure' })
  @IsNumber()
  uric: number;

  @ApiProperty({ description: 'NO3N content in the manure' })
  @IsNumber()
  nO3N: number;

  @ApiProperty({ description: 'P2O5 content in the manure' })
  @IsNumber()
  p2O5: number;

  @ApiProperty({ description: 'K2O content in the manure' })
  @IsNumber()
  k2O: number;

  @ApiProperty({ description: 'SO3 content in the manure' })
  @IsNumber()
  sO3: number;

  @ApiProperty({ description: 'MgO content in the manure' })
  @IsNumber()
  mgO: number;
}

class ApplicationRateDto {
  @ApiProperty({ description: 'Rate value of the manure application' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Unit of the application rate' })
  @IsString()
  unit: string;
}

class AutumnCropNitrogenUptakeDto {
  @ApiProperty({ description: 'Nitrogen uptake value of the autumn crop' })
  @IsNumber()
  value: number;

  @ApiProperty({ description: 'Unit of nitrogen uptake' })
  @IsString()
  unit: string;
}

class ManureApplicationDto {
  @ApiProperty({ type: ManureDetailsDto })
  @ValidateNested()
  manureDetails: ManureDetailsDto;

  @ApiProperty({ description: 'Date of the manure application' })
  @IsDateString()
  applicationDate: string;

  @ApiProperty({ type: ApplicationRateDto })
  @ValidateNested()
  applicationRate: ApplicationRateDto;

  @ApiProperty({ description: 'ID of the application method' })
  @IsInt()
  applicationMethodID: number;

  @ApiProperty({ description: 'ID of the incorporation method' })
  @IsInt()
  incorporationMethodID: number;

  @ApiProperty({ description: 'ID of the incorporation delay' })
  @IsInt()
  incorporationDelayID: number;

  @ApiProperty({ type: AutumnCropNitrogenUptakeDto })
  @ValidateNested()
  autumnCropNitrogenUptake: AutumnCropNitrogenUptakeDto;

  @ApiProperty({ description: 'Date of the end of drainage' })
  @IsDateString()
  endOfDrainageDate: string;

  @ApiProperty({ description: 'Post-application rainfall amount' })
  @IsInt()
  rainfallPostApplication: number;

  @ApiProperty({ description: 'Crop nitrogen uptake amount' })
  @IsInt()
  cropNUptake: number;

  @ApiProperty({ description: 'ID of the windspeed condition' })
  @IsInt()
  windspeedID: number;

  @ApiProperty({ description: 'ID of the rain type' })
  @IsInt()
  rainTypeID: number;

  @ApiProperty({ description: 'ID of the topsoil moisture level' })
  @IsInt()
  topsoilMoistureID: number;
}

export class CreateManureApplicationDto {
  @ApiProperty({ description: 'Run type for the application' })
  @IsInt()
  runType: number;

  @ApiProperty({ description: 'Postcode of the location' })
  @IsString()
  postcode: string;

  @ApiProperty({ description: 'ID of the country' })
  @IsInt()
  countryID: number;

  @ApiProperty({ type: FieldDto })
  @ValidateNested()
  field: FieldDto;

  @ApiProperty({ type: [ManureApplicationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  manureApplications: ManureApplicationDto[];
}
