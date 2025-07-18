const Joi = require("joi");

const NutrientsLoadingManuresDto = Joi.object({
  ID: Joi.number().integer().optional().allow(null).default(null),
  FarmID: Joi.number().integer().required(),
  ManureLookupType: Joi.string().max(250).allow(null, ""),
  ManureTypeID: Joi.number().integer().allow(null),
  ManureType: Joi.string().max(250).allow(null, ""),
  Quantity: Joi.number().precision(3).allow(null),
  NContent: Joi.number().precision(3).allow(null),
  NTotal: Joi.number().integer().allow(null),
  PContent: Joi.number().precision(3).allow(null),
  PTotal: Joi.number().integer().allow(null),
  DryMatterPercent: Joi.number().integer().allow(null),
  NH4N: Joi.number().precision(3).allow(null),
  UricAcid: Joi.number().precision(3).allow(null),
  NO3N: Joi.number().precision(3).allow(null),
  K2O: Joi.number().precision(3).allow(null),
  SO3: Joi.number().precision(3).allow(null),
  MgO: Joi.number().precision(3).allow(null),
  ManureDate: Joi.date().allow(null),
  FarmName: Joi.string().max(50).allow(null, ""),
  Address1: Joi.string().max(50).allow(null, ""),
  Address2: Joi.string().max(50).allow(null, ""),
  Address3: Joi.string().max(50).allow(null, ""),
  Address4: Joi.string().max(50).allow(null, ""),
  PostCode: Joi.string().max(50).allow(null, ""),
  Comments: Joi.string().max(255).allow(null, ""),
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

// Define the validation schema for NutrientsLoadingManuresDto
const CreateNutrientsLoadingManuresDto = Joi.object({
  NutrientsLoadingManure: NutrientsLoadingManuresDto.required(),
  SaveDefaultForFarm: Joi.boolean().required().default(false),
});


module.exports = { CreateNutrientsLoadingManuresDto, NutrientsLoadingManuresDto};
