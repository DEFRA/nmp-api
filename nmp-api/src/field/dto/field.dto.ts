import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import FieldEntity from '@db/entity/field.entity';
import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { CreateCropWithManagementPeriodsDto } from '@src/crop/dto/crop.dto';
import SnsAnalysesEntity from '@db/entity/sns-analysis.entity';

export class CreateFieldWithSoilAnalysisAndCropsDto {
  @ApiProperty()
  Field: FieldEntity;

  @ApiProperty({ nullable: true })
  SoilAnalysis: SoilAnalysisEntity;

  @ApiPropertyOptional({ nullable: true }) // Optional property that can be null
  SnsAnalysis?: SnsAnalysesEntity | null;

  @ApiProperty({ type: [CreateCropWithManagementPeriodsDto] })
  Crops: CreateCropWithManagementPeriodsDto[];
}

export class UpdateFieldDto {
  @ApiProperty()
  Field: FieldEntity;
}
