import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSoilAnalysisDto {
  @ApiProperty()
  SoilAnalysis: SoilAnalysisEntity;
}
