const Joi = require("joi");

const FarmsNVZEntitySchema = Joi.object({
  ID: Joi.number().integer().allow(null),
  FarmID: Joi.number().integer().optional(),
  NVZProgrammeID: Joi.number().integer().optional(),
  NVZProgrammeName: Joi.string().required(),  
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
}).required();

module.exports = {
  FarmsNVZEntitySchema,
};