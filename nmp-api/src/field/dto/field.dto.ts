import { ApiProperty } from '@nestjs/swagger';

import FieldEntity from '@db/entity/field.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';

export class CreateFieldWithSoilAnalysisAndCropsDto {
  @ApiProperty()
  Field: FieldEntity;

  @ApiProperty()
  SoilAnalysis: SoilAnalysisEntity;

  @ApiProperty({ type: [CreateCropWithManagementPeriodsDto] })
  Crops: CreateCropWithManagementPeriodsDto[];
}

export class UpdateFieldDto {
  @ApiProperty()
  Field: FieldEntity;
}
