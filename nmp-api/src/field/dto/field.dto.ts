import CropEntity from '@db/entity/crop.entity';
import FieldEntity from '@db/entity/field.entity';
import SoilAnalysesEntity from '@db/entity/soil-analyses.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeildWithSoilAnalysesAndCropsDto {
  @ApiProperty()
  Field: FieldEntity;

  @ApiProperty()
  SoilAnalyses: SoilAnalysesEntity;

  @ApiProperty({ type: [CropEntity] })
  Crops: CropEntity[];
}
