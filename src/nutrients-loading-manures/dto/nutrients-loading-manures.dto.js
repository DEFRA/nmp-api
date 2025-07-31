const Joi = require("joi");

const NutrientsLoadingManuresDto = Joi.object({
  ID: Joi.number().integer().optional().allow(null).default(null),
  FarmID: Joi.number().integer().required(),
  ManureLookupType: Joi.string().max(250).required(),
  ManureTypeID: Joi.number().integer().required(),
  ManureType: Joi.string().max(250).required(),
  Quantity: Joi.number().integer().required(),
  NContent: Joi.number().precision(3).required(),
  NTotal: Joi.number().integer().required(),
  PContent: Joi.number().precision(3).required(),
  PTotal: Joi.number().integer().required(),
  DryMatterPercent: Joi.number().precision(3).allow(null),
  NH4N: Joi.number().precision(3).allow(null),
  UricAcid: Joi.number().precision(3).allow(null),
  NO3N: Joi.number().precision(3).allow(null),
  K2O: Joi.number().precision(3).allow(null),
  SO3: Joi.number().precision(3).allow(null),
  MgO: Joi.number().precision(3).allow(null),
  ManureDate: Joi.date().required(),
  FarmName: Joi.string().max(50).required(),
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
  EncryptedID: Joi.string()
      .pattern(/^[a-zA-Z0-9]*$/) // Alphanumeric pattern
      .allow(null,"") // Allows null
      .optional(),
});

// Define the validation schema for NutrientsLoadingManuresDto
const CreateOrUpdateNutrientsLoadingManuresDto = Joi.object({
  NutrientsLoadingManure: NutrientsLoadingManuresDto.required(),
  SaveDefaultForFarm: Joi.boolean().required().default(false),
});


module.exports = { CreateOrUpdateNutrientsLoadingManuresDto, NutrientsLoadingManuresDto};
