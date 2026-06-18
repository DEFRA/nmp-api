const Joi = require("joi");
const maxHundred = 100;
const CreateMannerFinancialValuesDto = Joi.object({
  Id: Joi.number().integer().allow(null).default(null),

  MannerEstimationApplicationID: Joi.number().integer().required(),

  NitrogenValue: Joi.number().integer().required(),

  PhosphateValue: Joi.number().integer().required(),

  PotashValue: Joi.number().integer().required(),

  NitrogenProductId: Joi.number().integer().required(),

  PhosphateProductId: Joi.number().integer().required(),

  PotashProductId: Joi.number().integer().required(),

  NitrogenProductName: Joi.string().max(maxHundred).required(),

  PhosphateProductName: Joi.string().max(maxHundred).required(),

  PotashProductName: Joi.string().max(maxHundred).required(),

  NitrogenProductPrice: Joi.number().integer().required(),

  PhosphateProductPrice: Joi.number().integer().required(),

  PotashProductPrice: Joi.number().integer().required(),

  NitrogenPrice: Joi.number().integer().required(),

  PhosphatePrice: Joi.number().integer().required(),

  PotashPrice: Joi.number().integer().required(),

  CreatedOn: Joi.date().iso().allow(null).default(null),

  CreatedByID: Joi.number().integer().allow(null).default(null),

  ModifiedOn: Joi.date().iso().allow(null).default(null),

  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

module.exports = { CreateMannerFinancialValuesDto };
