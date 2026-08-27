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
  previousGrassId: Joi.number().allow(null),
  previousCropGroupId: Joi.number().allow(null),
  previousCropTypeId: Joi.number().allow(null),
  grassHistoryId: Joi.number().allow(null),
  snsId: Joi.number().allow(null),
  smnDepth: Joi.number().allow(null),
  measuredSmn: Joi.number().allow(null)
});

const RecommendationMannerOutputDto = Joi.object({
  id: Joi.number().allow(null),
  defoliationId: Joi.number().allow(null),
  totalN: Joi.number().required(),
  availableN: Joi.number().required(),
  totalP: Joi.number().required(),
  availableP: Joi.number().required(),
  totalK: Joi.number().required(),
  availableK: Joi.number().required(),
  totalS: Joi.number().required(),
  availableS: Joi.number().required(),
  totalM: Joi.number().required(),
});

const RecommendationOrganicMaterialDto = Joi.object({
  id: Joi.number().allow(null),
  defoliationId: Joi.number().allow(null),
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
  soilpH: Joi.number().optional().allow(null),
  sulphurDeficient: Joi.boolean().optional(),
  snsIndexId: Joi.number().optional().allow(null),
  pIndexId: Joi.number().optional().allow(null),
  kIndexId: Joi.number().optional().allow(null),
  mgIndexId: Joi.number().optional().allow(null),
  snsMethodologyId: Joi.number().optional().allow(null),
  snsCropOrder: Joi.number().allow(null),
  pMethodologyId: Joi.number().optional().allow(null),
  kMethodologyId: Joi.number().optional().allow(null),
  mgMethodologyId: Joi.number().optional().allow(null),
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



const RecommendationGrassFreshWeightYieldDto = Joi.object({
  position: Joi.number().required(),
  freshWeightYield: Joi.number().required(),
});

const RecommendationGrassDto = Joi.object({
  cropOrder: Joi.number().required(),
  swardTypeId: Joi.number().required(),
  swardManagementId: Joi.number().required(),
  defoliationSequenceId: Joi.number().required(),
  grassGrowthClassId: Joi.number().required(),
  siteClassId: Joi.number().allow(null),
  rotationalGrass: Joi.boolean().optional(),
  yield: Joi.number().allow(null),
  freshWeightYields: Joi.array()
    .items(RecommendationGrassFreshWeightYieldDto)
    .optional(),
  seasonId: Joi.number().required().allow(null)
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
  grass: RecommendationGrassDto.optional(),
  soil: RecommendationSoilDto,
  harvestYear: Joi.number().required(),
  rainfallAverage: Joi.number().required(),
  excessWinterRainfall: Joi.number().required(),
  excessWinterRainfallManuallyEntered: Joi.boolean(),
  mannerManures: Joi.boolean().optional().allow(null),
  organicMaterials: Joi.array()
    .items(RecommendationOrganicMaterialDto)
    .optional(),
  mannerOutputs: Joi.array() 
    .items(RecommendationMannerOutputDto)
    .optional(),
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
