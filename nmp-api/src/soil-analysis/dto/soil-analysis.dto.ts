import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSoilAnalysisDto extends SoilAnalysisEntity {
  @ApiProperty()
  FieldID: number;
}
export class UpdateSoilAnalysisDto extends CreateSoilAnalysisDto {}
