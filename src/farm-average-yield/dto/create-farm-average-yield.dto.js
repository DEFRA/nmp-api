const Joi = require("joi");

const CreateFarmAverageYieldDto = Joi.object({
  FarmID: Joi.number().integer().required(),
  HarvestYear: Joi.number().integer().required(),
  CropTypeID: Joi.number().integer().required(),

  AverageYield: Joi.number().precision(3).required(),

  // 🔹 Audit fields
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

module.exports = { CreateFarmAverageYieldDto };
