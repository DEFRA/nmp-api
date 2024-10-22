import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class CreateAutumnCropUptakeNitrogenDto {
  @ApiProperty()
  @IsInt()
  cropTypeId: number;

  @ApiProperty()
  @IsInt()
  applicationMonth: number;
}
