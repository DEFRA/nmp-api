import { ApiProperty } from '@nestjs/swagger';

class RecommendationPKBalanceDto {
  @ApiProperty()
  phosphate: number;

  @ApiProperty()
  potash: number;
}

class RecommendationNutrientsDto {
  @ApiProperty()
  nitrogen: boolean;

  @ApiProperty()
  phosphate: boolean;

  @ApiProperty()
  potash: boolean;

  @ApiProperty()
  magnesium: boolean;

  @ApiProperty()
  sodium: boolean;

  @ApiProperty()
  sulphur: boolean;

  @ApiProperty()
  lime: boolean;
}

class RecommendationPreviousCroppingDto {
  @ApiProperty()
  previousGrassId: number;

  @ApiProperty()
  previousCropGroupId: number;

  @ApiProperty()
  previousCropTypeId: number;

  @ApiProperty()
  smnDepth: number;

  @ApiProperty()
  measuredSmn: number;
}

class RecommendationOrganicMaterialDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  materialId: number;

  @ApiProperty()
  incorporationMethodId: number;

  @ApiProperty()
  applicationDate: Date;

  @ApiProperty()
  applicationRate: number;

  @ApiProperty()
  nitrogen: number;

  @ApiProperty()
  phosphate: number;

  @ApiProperty()
  potash: number;

  @ApiProperty()
  magnesium: number;

  @ApiProperty()
  sulphur: number;
}

class RecommendationMannerOutputDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  totalN: number;

  @ApiProperty()
  availableN: number;

  @ApiProperty()
  totalP: number;

  @ApiProperty()
  availableP: number;

  @ApiProperty()
  totalK: number;

  @ApiProperty()
  availableK: number;

  @ApiProperty()
  totalS: number;

  @ApiProperty()
  availableS: number;

  @ApiProperty()
  totalM: number;
}

class RecommendationSoilAnalysisDto {
  @ApiProperty()
  soilAnalysisDate: Date;

  @ApiProperty()
  soilpH: number;

  @ApiProperty()
  sulphurDeficient: boolean;

  @ApiProperty()
  snsIndexId: number;

  @ApiProperty()
  pIndexId: number;

  @ApiProperty()
  kIndexId: number;

  @ApiProperty()
  mgIndexId: number;

  @ApiProperty()
  snsMethodologyId: number;

  @ApiProperty()
  pMethodologyId: number;

  @ApiProperty()
  kMethodologyId: number;

  @ApiProperty()
  mgMethodologyId: number;
}

class RecommendationSoilDto {
  @ApiProperty()
  soilTypeId: number;

  @ApiProperty()
  kReleasingClay: boolean;

  @ApiProperty()
  nvzActionProgrammeId: number;

  @ApiProperty()
  psc: number;

  @ApiProperty({ type: RecommendationPKBalanceDto })
  pkBalance: RecommendationPKBalanceDto;

  @ApiProperty({ type: [RecommendationSoilAnalysisDto] })
  soilAnalyses: RecommendationSoilAnalysisDto[];
}

class RecommendationGrasslandSequenceDto {
  @ApiProperty()
  position: number;

  @ApiProperty()
  cropMaterialId: number;

  @ApiProperty()
  yield: number;
}

class RecommendationGrasslandDto {
  @ApiProperty()
  cropOrder: number;

  @ApiProperty()
  snsId: number;

  @ApiProperty()
  grassGrowthClassId: number;

  @ApiProperty()
  yieldTypeId: number;

  @ApiProperty()
  sequenceId: number;

  @ApiProperty({ type: [RecommendationGrasslandSequenceDto] })
  grasslandSequence: RecommendationGrasslandSequenceDto[];

  @ApiProperty()
  establishedDate: Date;

  @ApiProperty()
  seasonId: number;

  @ApiProperty()
  siteClassId: number;
}

class RecommendationArableDto {
  @ApiProperty()
  cropOrder: number;

  @ApiProperty()
  cropGroupId: number;

  @ApiProperty()
  cropTypeId: number;

  @ApiProperty()
  cropInfo1Id: number;

  @ApiProperty()
  cropInfo2Id: number;

  @ApiProperty()
  sowingDate: Date;

  @ApiProperty()
  expectedYield: number;
}

class RecommendationFieldDto {
  @ApiProperty()
  fieldType: number;

  @ApiProperty()
  multipleCrops: boolean;

  @ApiProperty({ type: [RecommendationArableDto] })
  arable: RecommendationArableDto[];

  @ApiProperty()
  grassland: RecommendationGrasslandDto;

  @ApiProperty()
  soil: RecommendationSoilDto;

  @ApiProperty()
  harvestYear: number;

  @ApiProperty()
  area: number;

  @ApiProperty()
  postcode: string;

  @ApiProperty()
  altitude: number;

  @ApiProperty()
  rainfallAverage: number;

  @ApiProperty()
  excessWinterRainfall: number;

  @ApiProperty()
  mannerManures: boolean;

  @ApiProperty({ type: [RecommendationOrganicMaterialDto] })
  organicMaterials: RecommendationOrganicMaterialDto[];

  @ApiProperty({ type: [RecommendationMannerOutputDto] })
  mannerOutputs: RecommendationMannerOutputDto[];

  @ApiProperty()
  previousCropping: RecommendationPreviousCroppingDto;

  @ApiProperty()
  countryId: number;
}

export class CalculateNutrientRecommendationsDto {
  @ApiProperty()
  field: RecommendationFieldDto;

  @ApiProperty()
  nutrients: RecommendationNutrientsDto;

  @ApiProperty()
  totals: boolean;

  @ApiProperty()
  referenceValue: string;
}

export class CalculateNutrientOfftakeDto {
  @ApiProperty()
  cropGroupId: number;

  @ApiProperty()
  cropTypeId: number;

  @ApiProperty()
  cropInfo1Id: number;

  @ApiProperty()
  cropInfo2Id: number;

  @ApiProperty()
  countryId: number;

  @ApiProperty()
  nutrientId: number;
}
