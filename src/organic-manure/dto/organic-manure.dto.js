const Joi = require("joi");

// Define the validation schema for OrganicManureEntity
const OrganicManureEntitySchema = Joi.object({
  ID: Joi.number().integer().required(),
  ManagementPeriodID: Joi.number().integer().required(),
  ManureTypeID: Joi.number().integer().required(),
  ApplicationDate: Joi.date().iso().allow(null),
  Confirm: Joi.boolean().allow(null),
  N: Joi.number().precision(3).required(),
  P2O5: Joi.number().precision(3).required(),
  K2O: Joi.number().precision(3).required(),
  MgO: Joi.number().precision(3).required(),
  SO3: Joi.number().precision(3).required(),
  AvailableN: Joi.number().precision(3).required(),
  ApplicationRate: Joi.number().integer().required(),
  DryMatterPercent: Joi.number().precision(2).required(),
  UricAcid: Joi.number().precision(2).required(),
  EndOfDrain: Joi.date().iso().allow(null),
  Rainfall: Joi.number().integer().required(),
  AreaSpread: Joi.number().precision(3).allow(null),
  ManureQuantity: Joi.number().precision(3).allow(null),
  ApplicationMethodID: Joi.number().integer().allow(null),
  IncorporationMethodID: Joi.number().integer().allow(null),
  IncorporationDelayID: Joi.number().integer().allow(null),
  NH4N: Joi.number().precision(3).required(),
  NO3N: Joi.number().precision(3).required(),
  AvailableP2O5: Joi.number().precision(3).allow(null),
  AvailableK2O: Joi.number().precision(3).allow(null),
  WindspeedID: Joi.number().integer().allow(null),
  RainfallWithinSixHoursID: Joi.number().integer().allow(null),
  MoistureID: Joi.number().integer().allow(null),
  AutumnCropNitrogenUptake: Joi.number().precision(2).default(0),
  SoilDrainageEndDate: Joi.date().iso().allow(null),
});

// Define the validation schema for OrganicManureDto
const OrganicManureDtoSchema = Joi.object({
  OrganicManure: OrganicManureEntitySchema.required(),
  FarmID: Joi.number().integer().required(),
  FieldTypeID: Joi.number().integer().required(),
  SaveDefaultForFarm: Joi.boolean().required(),
});

// Define the validation schema for CreateOrganicManuresWithFarmManureTypeDto
const CreateOrganicManuresWithFarmManureTypeDtoSchema = Joi.object({
  OrganicManures: Joi.array().items(OrganicManureDtoSchema).required(),
});

module.exports = {
  OrganicManureEntitySchema,
  OrganicManureDtoSchema,
  CreateOrganicManuresWithFarmManureTypeDtoSchema,
};