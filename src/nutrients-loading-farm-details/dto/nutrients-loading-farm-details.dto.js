const Joi = require("joi");

const NutrientsLoadingFarmDetailsDto = Joi.object({
  ID: Joi.number().integer().optional().allow(null).default(null), // Included for update
  FarmID: Joi.number().integer().required().allow(null), // Always required
  CalendarYear: Joi.number().integer().required(),
  LandInNVZ: Joi.number().precision(3).allow(null),
  LandNotNVZ: Joi.number().precision(3).allow(null),
  TotalFarmed: Joi.number().precision(3).allow(null),
  ManureTotal: Joi.number().integer().allow(null),
  Derogation: Joi.boolean().required(),
  GrassPercentage: Joi.number().integer().allow(null),
  ContingencyPlan: Joi.boolean().required(),
  IsAnyLivestockNumber: Joi.boolean().allow(null),
  IsAnyLivestockImportExport: Joi.boolean().allow(null),
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

module.exports = { NutrientsLoadingFarmDetailsDto };
