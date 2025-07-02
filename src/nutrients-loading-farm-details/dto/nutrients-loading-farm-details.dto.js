const Joi = require("joi");

const NutrientsLoadingFarmDetailsDto = Joi.object({
  Id: Joi.number().integer().optional().allow(null), // Included for update
  FarmId: Joi.number().integer().required().allow(null), // Always required
  CalendarYear: Joi.number().integer().required(),
  LandInNVZ: Joi.number().precision(3).allow(null),
  LandNotNVZ: Joi.number().precision(3).allow(null),
  TotalFarmed: Joi.number().precision(3).allow(null),
  ManureTotal: Joi.number().integer().allow(null),
  Derogation: Joi.boolean().required(),
  GrassPercentage: Joi.number().integer().allow(null),
  ContingencyPlan: Joi.boolean().required(),
});

module.exports = { NutrientsLoadingFarmDetailsDto };
