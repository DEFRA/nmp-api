import SoilAnalysisEntity from '@db/entity/soil-analysis.entity';
import { ApiProperty } from '@nestjs/swagger';

export class SoilAnalysisRequest extends SoilAnalysisEntity {
  @ApiProperty()
  FieldID: number;
}
export class CreateSoilAnalysisDto {
  @ApiProperty()
  SoilAnalysis: SoilAnalysisRequest;
}
export class UpdateSoilAnalysisDto {
  @ApiProperty()
  SoilAnalysis: SoilAnalysisRequest;
}
