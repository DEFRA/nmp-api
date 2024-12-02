const Joi = require("joi");

// Define the validation schema for FarmManureTypeEntity
const FarmManureTypeEntitySchema = Joi.object({
  ID: Joi.number().integer().required(),
  FarmID: Joi.number().integer().required(),
  ManureTypeID: Joi.number().integer().required(),
  ManureTypeName: Joi.string().optional().allow(null),
  FieldTypeID: Joi.number().integer().required(),
  DryMatter: Joi.number().precision(2).required(),
  TotalN: Joi.number().precision(3).required(),
  NH4N: Joi.number().precision(3).required(),
  UricAcid: Joi.number().precision(2).required(),
  NO3N: Joi.number().precision(3).required(),
  P2O5: Joi.number().precision(3).required(),
  K2O: Joi.number().precision(3).required(),
  SO3: Joi.number().precision(3).required(),
  MgO: Joi.number().precision(3).required(),

});



module.exports = {
  FarmManureTypeEntitySchema,
};
