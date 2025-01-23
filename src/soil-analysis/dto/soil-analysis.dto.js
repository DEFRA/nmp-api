const Joi = require("joi");

const SoilAnalysisDto = Joi.object({
  FieldID: Joi.number().integer().required().allow(null),
  Year: Joi.number().integer().required().allow(null),
  SulphurDeficient: Joi.boolean().required().allow(null),
  Date: Joi.date().iso().required().allow(null),
  PH: Joi.number().required().allow(null),
  PhosphorusMethodologyID: Joi.number().integer().required().allow(null),
  Phosphorus: Joi.number().required().allow(null),
  PhosphorusIndex: Joi.number().integer().required().allow(null),
  Potassium: Joi.number().required().allow(null),
  PotassiumIndex: Joi.number().integer().min(-2).max(9).required().allow(null),
  Magnesium: Joi.number().required().allow(null),
  MagnesiumIndex: Joi.number().integer().required().allow(null),
  SoilNitrogenSupply: Joi.number().required().allow(null),
  SoilNitrogenSupplyIndex: Joi.number().integer().required().allow(null),
  SoilNitrogenSampleDate: Joi.date().iso().optional().allow(null),
  Sodium: Joi.number().required().allow(null),
  Lime: Joi.number().required().allow(null),
  PhosphorusStatus: Joi.string().required().allow(null),
  PotassiumAnalysis: Joi.string().required().allow(null),
  PotassiumStatus: Joi.string().required().allow(null),
  MagnesiumAnalysis: Joi.string().required().allow(null),
  MagnesiumStatus: Joi.string().required().allow(null),
  NitrogenResidueGroup: Joi.string().required().allow(null),
  Comments: Joi.string().optional().allow(null),
  PreviousID: Joi.number().integer().optional().allow(null),
  CreatedOn: Joi.date().iso().allow(null).optional(),
  CreatedByID: Joi.number().integer().allow(null).optional(),
  ModifiedOn: Joi.date().iso().allow(null).optional(),
  ModifiedByID: Joi.number().integer().allow(null).optional(),
});

const PKBalanceDto = Joi.object({
  ID: Joi.number().integer().allow(null).optional(),
  Year: Joi.number().required(),
  FieldID: Joi.number().required(),
  PBalance: Joi.number().required(),
  KBalance: Joi.number().required(),
  PreviousID:Joi.number().allow(null).optional(),
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
});
const CreateSoilAnalysisDto = Joi.object({
  SoilAnalysis: SoilAnalysisDto.required()
});

const UpdateSoilAnalysisDto = Joi.object({
  SoilAnalysis: SoilAnalysisDto.required(),
  PKBalance:PKBalanceDto.optional().allow(null)
});

module.exports = {
  CreateSoilAnalysisDto,
  UpdateSoilAnalysisDto
};
