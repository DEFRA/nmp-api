const Joi = require("joi");

const Step1ArablePotatoDto = Joi.object({
  depth0To30Cm: Joi.number().required(),
  depth30To60Cm: Joi.number().required(),
  depth60To90Cm: Joi.number().required(),
}).optional();

const Step1VegDto = Joi.object({
  depthCm: Joi.number().required(),
  depthValue: Joi.number().required(),
}).optional();

const Step2Dto = Joi.object({
  shootNumber: Joi.number().required(),
  greenAreaIndex: Joi.number().required(),
  cropHeight: Joi.number().required(),
}).required();

const Step3Dto = Joi.object({
  adjustment: Joi.number().required(),
  organicMatterPercentage: Joi.number().required(),
}).required();

const CalculateSnsIndexRequest = Joi.object({
  cropTypeId: Joi.number().required(),
  seasonId: Joi.number().required(),
  step1ArablePotato: Step1ArablePotatoDto,
  step1Veg: Step1VegDto,
  step2: Step2Dto.required(),
  step3: Step3Dto.required(),
});

module.exports = {
  CalculateSnsIndexRequest,
};
