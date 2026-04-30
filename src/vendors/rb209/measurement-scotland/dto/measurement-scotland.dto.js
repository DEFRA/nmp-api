const Joi = require("joi");

const smnCalculationRequest = Joi.object({
  smnDepth: Joi.number().required(),
  measuredSmn: Joi.number().required(),
})

module.exports = {
  smnCalculationRequest
};
