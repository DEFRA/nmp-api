import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsString } from "class-validator";

export class CreateRainfallPostApplicationDto {
  @ApiProperty()
  @IsDateString()
  applicationDate: Date;

  @ApiProperty()
  @IsDateString()
  endOfSoilDrainageDate: Date;

  @ApiProperty()
  @IsString()
  climateDataPostcode: string;
}
