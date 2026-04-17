const Joi = require("joi");

const MergeFarmAverageYieldItemDto = Joi.object({
  FarmID: Joi.number().integer().required(),
  HarvestYear: Joi.number().integer().required(),
  CropTypeID: Joi.number().integer().required(),
  AverageYield: Joi.number().precision(3).allow(null),
  CreatedOn: Joi.date().allow(null),
  CreatedByID: Joi.number().allow(null),
  ModifiedOn: Joi.date().allow(null),
  ModifiedByID: Joi.date().allow(null)
});

const MergeFarmAverageYieldDto = Joi.array()
  .items(MergeFarmAverageYieldItemDto)
  .required();

module.exports = { MergeFarmAverageYieldDto };
