import { ApiProperty } from '@nestjs/swagger';

import CropEntity from '@db/entity/crop.entity';
import ManagementPeriodEntity from '@db/entity/management-period.entity';

export class CreateCropWithManagementPeriodsDto {
  @ApiProperty({ type: CropEntity })
  Crop: CropEntity;

  @ApiProperty({ type: [ManagementPeriodEntity] })
  ManagementPeriods: ManagementPeriodEntity[];
}
