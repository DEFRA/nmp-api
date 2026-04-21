const Joi = require("joi");
const precisionThree =3;
const precisionTwo =2;
// Define the validation schema for FarmManureTypeEntity
const FarmManureTypeEntitySchema = Joi.object({
  ID: Joi.number().integer().required(),
  FarmID: Joi.number().integer().required(),
  ManureTypeID: Joi.number().integer().required(),
  ManureTypeName: Joi.string().optional().allow(null),
  FieldTypeID: Joi.number().integer().required(),
  DryMatter: Joi.number().precision(precisionTwo).required(),
  TotalN: Joi.number().precision(precisionThree).required(),
  NH4N: Joi.number().precision(precisionThree).required(),
  UricAcid: Joi.number().precision(precisionTwo).required(),
  NO3N: Joi.number().precision(precisionThree).required(),
  P2O5: Joi.number().precision(precisionThree).required(),
  K2O: Joi.number().precision(precisionThree).required(),
  SO3: Joi.number().precision(precisionThree).required(),
  MgO: Joi.number().precision(precisionThree).required(),
});



module.exports = {
  FarmManureTypeEntitySchema,
};
