import { ApiProperty } from '@nestjs/swagger';

import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

export class CreateCropWithManagementPeriodsDto {
  @ApiProperty({ type: CropEntity })
  Crop: CropEntity;

  @ApiProperty({ type: [ManagementPeriodEntity] })
  ManagementPeriods: ManagementPeriodEntity[];
}

class CropDto extends CropEntity {
  @ApiProperty()
  FieldID: number;
}

class CreateCropPlansDto {
  @ApiProperty({ type: CropDto })
  Crop: CropDto;

  @ApiProperty({ type: [ManagementPeriodEntity] })
  ManagementPeriods: ManagementPeriodEntity[];
}
export class CreatePlanDto {
  @ApiProperty({ type: [CreateCropPlansDto] })
  Crops: CreateCropPlansDto[];
}
