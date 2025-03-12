const Joi = require("joi");

const SnsAnalysisDto = Joi.object({
  CropID: Joi.number().integer().required(),
  CropTypeID: Joi.number().integer().required(),
  SampleDate: Joi.date().iso().optional().allow(null),
  SnsAt0to30cm: Joi.number().integer().optional().allow(null),
  SnsAt30to60cm: Joi.number().integer().optional().allow(null),
  SnsAt60to90cm: Joi.number().integer().optional().allow(null),
  SampleDepth: Joi.number().integer().optional().allow(null),
  SoilMineralNitrogen: Joi.number().integer().optional().allow(null),
  NumberOfShoots: Joi.number().integer().optional().allow(null),
  GreenAreaIndex: Joi.number().precision(3).optional().allow(null),
  CropHeight: Joi.number().precision(3).optional().allow(null),
  SeasonId: Joi.number().integer().optional().allow(null),
  PercentageOfOrganicMatter: Joi.number().precision(3).optional().allow(null),
  AdjustmentValue: Joi.number().precision(3).optional().allow(null),
  SoilNitrogenSupplyValue: Joi.number().integer().optional().allow(null),
  SoilNitrogenSupplyIndex: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .optional()
    .allow(null),
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

const CreateSnsAnalysisDto = Joi.object({
  SnsAnalysis: SnsAnalysisDto.required(),
});

const UpdateSnsAnalysisDto = Joi.object({
  SnsAnalysis: SnsAnalysisDto.required(),
});

module.exports = {
  CreateSnsAnalysisDto,
  UpdateSnsAnalysisDto,
};
