import { ApiProperty } from '@nestjs/swagger';

import FieldEntity from '@db/entity/field.entity';
import SoilAnalysesEntity from '@db/entity/soil-analyses.entity';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';

export class CreateFieldWithSoilAnalysesAndCropsDto {
  @ApiProperty()
  Field: FieldEntity;

  @ApiProperty()
  SoilAnalyses: SoilAnalysesEntity;

  @ApiProperty({ type: [CreateCropWithManagementPeriodsDto] })
  Crops: CreateCropWithManagementPeriodsDto[];
}
