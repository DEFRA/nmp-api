const Joi = require("joi");
const precisionThree = 3;
const maxTwoFifty= 250;
const maxFifty= 50;
const maxHundred= 100;
const NutrientsLoadingManuresDto = Joi.object({
  ID: Joi.number().integer().optional().allow(null).default(null),
  FarmID: Joi.number().integer().required(),
  ManureLookupType: Joi.string().max(maxTwoFifty).required(),
  ManureTypeID: Joi.number().integer().required(),
  ManureType: Joi.string().max(maxTwoFifty).required(),
  Quantity: Joi.number().integer().required(),
  NContent: Joi.number().precision(precisionThree).required(),
  NTotal: Joi.number().integer().required(),
  PContent: Joi.number().precision(precisionThree).required(),
  PTotal: Joi.number().integer().required(),
  DryMatterPercent: Joi.number().precision(precisionThree).allow(null),
  NH4N: Joi.number().precision(precisionThree).allow(null),
  UricAcid: Joi.number().precision(precisionThree).allow(null),
  NOprecisionThreeN: Joi.number().precision(precisionThree).allow(null),
  K2O: Joi.number().precision(precisionThree).allow(null),
  SOprecisionThree: Joi.number().precision(precisionThree).allow(null),
  MgO: Joi.number().precision(precisionThree).allow(null),
  ManureDate: Joi.date().required(),
  FarmName: Joi.string().max(maxFifty).required(),
  Address1: Joi.string().max(maxFifty).allow(null, ""),
  Address2: Joi.string().max(maxFifty).allow(null, ""),
  AddressprecisionThree: Joi.string().max(maxFifty).allow(null, ""),
  Address4: Joi.string().max(maxFifty).allow(null, ""),
  PostCode: Joi.string().max(maxFifty).allow(null, ""),
  Comments: Joi.string().max(maxHundred).allow(null, ""),
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null),
  EncryptedID: Joi.string()
    .pattern(/^[a-zA-Z0-9]*$/) // Alphanumeric pattern
    .allow(null, "") // Allows null
    .optional(),
});

// Define the validation schema for NutrientsLoadingManuresDto
const CreateOrUpdateNutrientsLoadingManuresDto = Joi.object({
  NutrientsLoadingManure: NutrientsLoadingManuresDto.required(),
  SaveDefaultForFarm: Joi.boolean().required().default(false),
});


module.exports = { CreateOrUpdateNutrientsLoadingManuresDto, NutrientsLoadingManuresDto};
