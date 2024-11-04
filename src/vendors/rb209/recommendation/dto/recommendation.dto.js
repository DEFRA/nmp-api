const Joi = require("joi");

const RecommendationNutrientsDto = Joi.object({
  nitrogen: Joi.boolean().required(),
  phosphate: Joi.boolean().required(),
  potash: Joi.boolean().required(),
  magnesium: Joi.boolean().required(),
  sodium: Joi.boolean().required(),
  sulphur: Joi.boolean().required(),
  lime: Joi.boolean().required(),
});

const RecommendationPreviousCroppingDto = Joi.object({
  previousGrassId: Joi.number().required(),
  previousCropGroupId: Joi.number().required(),
  previousCropTypeId: Joi.number().required(),
  snsId: Joi.number().required(),
  smnDepth: Joi.number().required(),
  measuredSmn: Joi.number().required(),
});

const RecommendationOrganicMaterialDto = Joi.object({
  materialId: Joi.number().required(),
  incorporationMethodId: Joi.number().required(),
  applicationDate: Joi.date().iso().required(),
  applicationRate: Joi.number().required(),
  nitrogen: Joi.number().required(),
  phosphate: Joi.number().required(),
  potash: Joi.number().required(),
  magnesium: Joi.number().required(),
  sulphur: Joi.number().required(),
});

const RecommendationSoilAnalysisDto = Joi.object({
  soilAnalysisDate: Joi.date().iso().required(),
  soilpH: Joi.number().required(),
  sulphurDeficient: Joi.boolean().required(),
  snsIndexId: Joi.number().required(),
  pIndexId: Joi.number().required(),
  kIndexId: Joi.number().required(),
  mgIndexId: Joi.number().required(),
  snsMethodologyId: Joi.number().required(),
  pMethodologyId: Joi.number().required(),
  kMethodologyId: Joi.number().required(),
  mgMethodologyId: Joi.number().required(),
});

const RecommendationGrasslandSequenceDto = Joi.object({
  position: Joi.number().required(),
  cropMaterialId: Joi.number().required(),
  yield: Joi.number().required(),
});

const RecommendationSoilDto = Joi.object({
  soilTypeId: Joi.number().required(),
  kReleasingClay: Joi.boolean().allow(null).required(),
  nvzActionProgrammeId: Joi.number().required(),
  psc: Joi.number().required(),
  soilAnalyses: Joi.array().items(RecommendationSoilAnalysisDto).required(),
});

const RecommendationGrasslandDto = Joi.object({
  cropOrder: Joi.number().required(),
  snsId: Joi.number().required(),
  grassGrowthClassId: Joi.number().required(),
  yieldTypeId: Joi.number().required(),
  sequenceId: Joi.number().required(),
  grasslandSequence: Joi.array()
    .items(RecommendationGrasslandSequenceDto)
    .required(),
  establishedDate: Joi.date().iso().required(),
  seasonId: Joi.number().required(),
  siteClassId: Joi.number().required(),
});

const RecommendationArableDto = Joi.object({
  cropOrder: Joi.number().required(),
  cropGroupId: Joi.number().required(),
  cropTypeId: Joi.number().required(),
  cropInfo1Id: Joi.number().allow(null).required(),
  cropInfo2Id: Joi.number().allow(null).required(),
  sowingDate: Joi.date().iso().required(),
  expectedYield: Joi.number().required(),
});

const RecommendationFieldDto = Joi.object({
  fieldType: Joi.number().required(),
  multipleCrops: Joi.boolean().required(),
  arable: Joi.array().items(RecommendationArableDto),
  grassland: RecommendationGrasslandDto,
  soil: RecommendationSoilDto,
  harvestYear: Joi.number().required(),
  area: Joi.number().required(),
  postcode: Joi.string().required(),
  altitude: Joi.number().required(),
  rainfallAverage: Joi.number().required(),
  excessWinterRainfall: Joi.number().required(),
  organicMaterials: Joi.array()
    .items(RecommendationOrganicMaterialDto)
    .required(),
  previousCropping: RecommendationPreviousCroppingDto.required(),
  countryId: Joi.number().required(),
});

const CalculateNutrientRecommendationsDto = Joi.object({
  field: RecommendationFieldDto.required(),
  nutrients: RecommendationNutrientsDto.required(),
  totals: Joi.boolean().required(),
  referenceValue: Joi.string().allow(null).required(),
});

const CalculateNutrientOfftakeDto = Joi.object({
  cropGroupId: Joi.number().required(),
  cropTypeId: Joi.number().required(),
  cropInfo1Id: Joi.number().required(),
  cropInfo2Id: Joi.number().required(),
  countryId: Joi.number().required(),
  nutrientId: Joi.number().required(),
});

module.exports = {
  CalculateNutrientRecommendationsDto,
  CalculateNutrientOfftakeDto,
};
