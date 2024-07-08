import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSoilAnalysisDto {
  @ApiProperty()
  SoilAnalysis: SoilAnalysisEntity;
}
export class UpdateSoilAnalysisDto extends CreateSoilAnalysisDto {}
