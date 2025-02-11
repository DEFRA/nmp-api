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
  previousGrassId: Joi.number(),
  previousCropGroupId: Joi.number(),
  previousCropTypeId: Joi.number(),
  snsId: Joi.number().allow(null),
  smnDepth: Joi.number().allow(null),
  measuredSmn: Joi.number().allow(null),
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
  soilpH: Joi.number().required().allow(null),
  sulphurDeficient: Joi.boolean().required(),
  snsIndexId: Joi.number().required().allow(null),
  pIndexId: Joi.number().required().allow(null),
  kIndexId: Joi.number().required().allow(null),
  mgIndexId: Joi.number().required().allow(null),
  snsMethodologyId: Joi.number().required().allow(null),
  pMethodologyId: Joi.number().required().allow(null),
  kMethodologyId: Joi.number().required().allow(null),
  mgMethodologyId: Joi.number().required().allow(null),
});

const RecommendationGrasslandSequenceDto = Joi.object({
  position: Joi.number(),
  cropMaterialId: Joi.number(),
  yield: Joi.number(),
});
const PKBalanceDto = Joi.object({
  phosphate: Joi.number().required().allow(null),
  potash: Joi.number().required().allow(null),
});
const RecommendationSoilDto = Joi.object({
  soilTypeId: Joi.number().required(),
  kReleasingClay: Joi.boolean().allow(null).required(),
  nvzActionProgrammeId: Joi.number().required(),
  psc: Joi.number().required(),
  pkBalance:PKBalanceDto,
  soilAnalyses: Joi.array().items(RecommendationSoilAnalysisDto).required(),
});

const RecommendationGrasslandDto = Joi.object({
  cropOrder: Joi.number(),
  snsId: Joi.number(),
  grassGrowthClassId: Joi.number(),
  yieldTypeId: Joi.number(),
  sequenceId: Joi.number(),
  grasslandSequence: Joi.array()
    .items(RecommendationGrasslandSequenceDto),    
  establishedDate: Joi.date().iso(),
  seasonId: Joi.number(),
  siteClassId: Joi.number(),
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
  grassland: RecommendationGrasslandDto.optional(),
  soil: RecommendationSoilDto,
  harvestYear: Joi.number().required(),
  area: Joi.number().required(),
  postcode: Joi.string().required(),
  altitude: Joi.number().required(),
  rainfallAverage: Joi.number().required(),
  excessWinterRainfall: Joi.number().required(),
  mannerManures: Joi.boolean().optional().allow(null),
  organicMaterials: Joi.array()
    .items(RecommendationOrganicMaterialDto)
    .required(),
  previousCropping: RecommendationPreviousCroppingDto.optional(),
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
