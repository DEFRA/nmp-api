const Joi = require("joi");

const SoilAnalysisDto = Joi.object({
  Year: Joi.number().integer().required(),
  SulphurDeficient: Joi.boolean().required(),
  Date: Joi.date().iso().required(),
  PH: Joi.number().required(),
  PhosphorusMethodologyID: Joi.number().integer().required(),
  Phosphorus: Joi.number().required(),
  PhosphorusIndex: Joi.number().integer().required(),
  Potassium: Joi.number().required(),
  PotassiumIndex: Joi.number().integer().required(),
  Magnesium: Joi.number().required(),
  MagnesiumIndex: Joi.number().integer().required(),
  SoilNitrogenSupply: Joi.number().required(),
  SoilNitrogenSupplyIndex: Joi.number().integer().required(),
  SoilNitrogenSampleDate:Joi.date().iso().optional().allow(null),
  Sodium: Joi.number().required(),
  Lime: Joi.number().required(),
  PhosphorusStatus: Joi.string().required(),
  PotassiumAnalysis: Joi.string().required(),
  PotassiumStatus: Joi.string().required(),
  MagnesiumAnalysis: Joi.string().required(),
  MagnesiumStatus: Joi.string().required(),
  NitrogenResidueGroup: Joi.string().required(),
  Comments: Joi.string().optional(),
  PreviousID: Joi.number().integer().optional(),
  FieldID: Joi.number().integer().required(),
});

const CreateSoilAnalysisDto = Joi.object({
  SoilAnalysis: SoilAnalysisDto.required(),
});

module.exports = {
  CreateSoilAnalysisDto,
};
