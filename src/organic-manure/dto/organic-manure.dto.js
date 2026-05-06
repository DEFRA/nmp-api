const Joi = require("joi");
const precisionThree = 3,maximumLength = 250;
// Define the validation schema for OrganicManureEntity
const OrganicManureEntitySchema = Joi.object({
  ID: Joi.number().integer().required().allow(null).default(null),
  ManagementPeriodID: Joi.number().integer().required(),
  ManureTypeID: Joi.number().integer().required(),
  ManureTypeName: Joi.string().optional(),
  ApplicationDate: Joi.date().iso().allow(null),
  Confirm: Joi.boolean().allow(null),
  N: Joi.number().precision(precisionThree).required(),
  P2O5: Joi.number().precision(precisionThree).required(),
  K2O: Joi.number().precision(precisionThree).required(),
  MgO: Joi.number().precision(precisionThree).required(),
  SO3: Joi.number().precision(precisionThree).required(),
  AvailableN: Joi.number().precision(precisionThree).required(),
  ApplicationRate: Joi.number().precision(1).required(),
  DryMatterPercent: Joi.number().precision(2).required(),
  UricAcid: Joi.number().precision(2).required(),
  EndOfDrain: Joi.date().iso().allow(null),
  Rainfall: Joi.number().integer().required(),
  AreaSpread: Joi.number().precision(precisionThree).allow(null),
  ManureQuantity: Joi.number().precision(precisionThree).allow(null),
  ApplicationMethodID: Joi.number().integer().allow(null),
  IncorporationMethodID: Joi.number().integer().allow(null),
  IncorporationDelayID: Joi.number().integer().allow(null),
  NH4N: Joi.number().precision(precisionThree).required(),
  NO3N: Joi.number().precision(precisionThree).required(),
  AvailableP2O5: Joi.number().precision(precisionThree).allow(null),
  AvailableK2O: Joi.number().precision(precisionThree).allow(null),
  AvailableSO3: Joi.number().precision(precisionThree).allow(null),
  TotalN: Joi.number().precision(precisionThree).allow(null),
  TotalP2O5: Joi.number().precision(precisionThree).allow(null),
  TotalK2O: Joi.number().precision(precisionThree).allow(null),
  TotalSO3: Joi.number().precision(precisionThree).allow(null),
  TotalMgO: Joi.number().precision(precisionThree).allow(null),
  WindspeedID: Joi.number().integer().allow(null),
  RainfallWithinSixHoursID: Joi.number().integer().allow(null),
  MoistureID: Joi.number().integer().allow(null),
  AutumnCropNitrogenUptake: Joi.number().integer().precision(2).default(0),
  SoilDrainageEndDate: Joi.date().iso().allow(null),
  AvailableNForNMax: Joi.number().precision(precisionThree).allow(null),
  FieldName: Joi.string().optional().allow(null),
  EncryptedCounter: Joi.string().optional().allow(null),
  Defoliation: Joi.number().integer().optional().allow(null),
  FieldID: Joi.number().integer().allow(null),
  DefoliationName: Joi.string().optional().allow(null),
  AvailableNForNextYear: Joi.number().precision(precisionThree).allow(null),
  AvailableNForNextDefoliation: Joi.number().precision(precisionThree).allow(null)
});

const UpdateOrganicManureEntitySchema = Joi.object({
  ID: Joi.number().integer().required(),
  ManagementPeriodID: Joi.number().integer().required(),
  ManureTypeID: Joi.number().integer().required(),
  ManureTypeName: Joi.string().optional(),
  ApplicationDate: Joi.date().iso().allow(null),
  Confirm: Joi.boolean().allow(null),
  N: Joi.number().precision(precisionThree).required(),
  P2O5: Joi.number().precision(precisionThree).required(),
  K2O: Joi.number().precision(precisionThree).required(),
  MgO: Joi.number().precision(precisionThree).required(),
  SO3: Joi.number().precision(precisionThree).required(),
  AvailableN: Joi.number().precision(precisionThree).required(),
  ApplicationRate: Joi.number().precision(1).required(),
  DryMatterPercent: Joi.number().precision(2).required(),
  UricAcid: Joi.number().precision(2).required(),
  EndOfDrain: Joi.date().iso().allow(null),
  Rainfall: Joi.number().integer().required(),
  AreaSpread: Joi.number().precision(precisionThree).allow(null),
  ManureQuantity: Joi.number().precision(precisionThree).allow(null),
  ApplicationMethodID: Joi.number().integer().allow(null),
  IncorporationMethodID: Joi.number().integer().allow(null),
  IncorporationDelayID: Joi.number().integer().allow(null),
  NH4N: Joi.number().precision(precisionThree).required(),
  NO3N: Joi.number().precision(precisionThree).required(),
  AvailableP2O5: Joi.number().precision(precisionThree).allow(null),
  AvailableK2O: Joi.number().precision(precisionThree).allow(null),
  AvailableSO3: Joi.number().precision(precisionThree).allow(null),
  WindspeedID: Joi.number().integer().allow(null),
  RainfallWithinSixHoursID: Joi.number().integer().allow(null),
  MoistureID: Joi.number().integer().allow(null),
  AutumnCropNitrogenUptake: Joi.number().integer().precision(2).default(0),
  AvailableNForNMax: Joi.number().precision(precisionThree).allow(null),
  AvailableNForNextYear: Joi.number().precision(precisionThree).allow(null),
  AvailableNForNextDefoliation: Joi.number().precision(precisionThree).allow(null)
});

const WarningMessageItemSchema = Joi.object({
  ID: Joi.number().integer().optional().allow(null).default(null),
  FieldID: Joi.number().integer().required(),
  CropID: Joi.number().integer().required(),
  JoiningID: Joi.number().integer().required().allow(null).default(null),
  Header: Joi.string().max(maximumLength).optional().allow(null),
  Para1: Joi.string().optional().allow(null),
  Para2: Joi.string().optional().allow(null),
  Para3: Joi.string().optional().allow(null),
  WarningCodeID: Joi.number().integer().required(),
  WarningLevelID: Joi.number().integer().required(),
  CreatedOn: Joi.date().optional().allow(null).default(null),
  CreatedByID: Joi.number().integer().optional().allow(null).default(null),
  ModifiedOn: Joi.date().optional().allow(null).default(null),
  ModifiedByID: Joi.number().integer().optional().allow(null).default(null),
  PreviousID: Joi.number().integer().optional().allow(null),
});

// Define the validation schema for OrganicManureDto
const OrganicManureDtoSchema = Joi.object({
  OrganicManure: OrganicManureEntitySchema.required(),
  WarningMessages: Joi.array()
  .items(WarningMessageItemSchema)
  .min(1)
  .optional()
  .allow(null),
  FarmID: Joi.number().integer().required(),
  FieldTypeID: Joi.number().integer().required(),
  SaveDefaultForFarm: Joi.boolean().required().default(false)
});

// Define the validation schema for OrganicManureDto
const UpdateOrganicManureDtoSchema = Joi.object({
  OrganicManure: UpdateOrganicManureEntitySchema.required(),
  WarningMessages: Joi.array()
    .items(WarningMessageItemSchema)
    .min(1)
    .optional()
    .allow(null),
  FarmID: Joi.number().integer().required(),
  FieldTypeID: Joi.number().integer().required(),
  SaveDefaultForFarm: Joi.boolean().required().default(false),
});


// Define the validation schema for CreateOrganicManuresWithFarmManureTypeDto
const CreateOrganicManuresWithFarmManureTypeDtoSchema = Joi.object({
  OrganicManures: Joi.array().items(OrganicManureDtoSchema).required(),
});

// Define the validation schema for CreateOrganicManuresWithFarmManureTypeDto
const UpdateOrganicManuresWithFarmManureTypeDtoSchema = Joi.object({
  OrganicManures: Joi.array().items(UpdateOrganicManureDtoSchema).required(),
});

module.exports = {
  OrganicManureEntitySchema,
  OrganicManureDtoSchema,
  CreateOrganicManuresWithFarmManureTypeDtoSchema,
  UpdateOrganicManuresWithFarmManureTypeDtoSchema,
  WarningMessageItemSchema
};

