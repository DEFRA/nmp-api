const Joi = require("joi");

const Step1ArablePotatoDto = Joi.object({
  depth0To30Cm: Joi.number().required(),
  depth30To60Cm: Joi.number().required(),
  depth60To90Cm: Joi.number().required(),
}).optional().allow(null);

const Step1VegDto = Joi.object({
  depthCm: Joi.number().required(),
  depthValue: Joi.number().required(),
}).optional().allow(null);

const Step2Dto = Joi.object({
  shootNumber: Joi.number().optional().allow(null),
  greenAreaIndex: Joi.number().optional().allow(null),
  cropHeight: Joi.number().optional().allow(null),
}).optional().allow(null);

const Step3Dto = Joi.object({
  adjustment: Joi.number().optional().allow(null),
  organicMatterPercentage: Joi.number().optional().allow(null),
}).optional().allow(null);

const CalculateSnsIndexRequest = Joi.object({
  cropTypeId: Joi.number().required(),
  seasonId: Joi.number().required(),
  step1ArablePotato: Step1ArablePotatoDto,
  step1Veg: Step1VegDto,
  step2: Step2Dto,
  step3: Step3Dto,
});

module.exports = {
  CalculateSnsIndexRequest,
};
