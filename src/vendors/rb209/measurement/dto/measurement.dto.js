const Joi = require("joi");

const Step1ArablePotatoDto = Joi.object({
  Depth0To30Cm: Joi.number().required(),
  Depth30To60Cm: Joi.number().required(),
  Depth60To90Cm: Joi.number().required().allow(null),
}).optional().allow(null);

const Step1VegDto = Joi.object({
  DepthCm: Joi.number().required(),
  DepthValue: Joi.number().required(),
}).optional().allow(null);

const Step2Dto = Joi.object({
  ShootNumber: Joi.number().optional().allow(null),
  GreenAreaIndex: Joi.number().optional().allow(null),
  CropHeight: Joi.number().optional().allow(null),
}).optional().allow(null);

const Step3Dto = Joi.object({
  Adjustment: Joi.number().optional().allow(null),
  OrganicMatterPercentage: Joi.number().optional().allow(null),
}).optional().allow(null);

const CalculateSnsIndexRequest = Joi.object({
  CropTypeId: Joi.number().required(),
  SeasonId: Joi.number().required(),
  Step1ArablePotato: Step1ArablePotatoDto,
  Step1Veg: Step1VegDto,
  Step2: Step2Dto,
  Step3: Step3Dto,
});

module.exports = {
  CalculateSnsIndexRequest,
};
