const Joi = require("joi");
const {
  CreateCropWithManagementPeriodsDto,
} = require("../../crop/dto/crops.dto");
const maxTwentyValues = 20,
  maxTwoFiftyFive = 255,
  minMinuesTwo = -2,
  precisionEighteen = 18,
  precisionNine = 9,
  precisionThree = 3,
  precisionOne = 1;
const AuditFields = {
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
};

const FieldEntitySchema = Joi.object({
  ID: Joi.number().integer().allow(null),
  SoilTypeID: Joi.number().integer().optional(),
  NVZProgrammeID: Joi.number().integer().optional(),
  PscIndexID: Joi.number().integer().optional().allow(null),
  Name: Joi.string().required(),
  LPIDNumber: Joi.string().optional().allow(null),
  NationalGridReference: Joi.string().optional().allow(null),
  OtherReference: Joi.string().optional().allow(null),
  TotalArea: Joi.number().required(),
  CroppedArea: Joi.number().optional(),
  ManureNonSpreadingArea: Joi.number().optional().allow(null),
  SoilReleasingClay: Joi.boolean().optional().allow(null),
  SoilOverChalk: Joi.boolean().optional().allow(null),
  IsWithinNVZ: Joi.boolean().optional(),
  IsAbove300SeaLevel: Joi.boolean().optional(),
  IsActive: Joi.boolean().required(),
  ...AuditFields,
  EncryptedFieldId: Joi.string()
    .pattern(/^[a-zA-Z0-9]*$/) // Alphanumeric pattern
    .allow(null) // Allows null
    .optional(),
}).required();

const SoilAnalysisSchema = Joi.object({
  FieldID: Joi.number().integer().allow(null).optional(),
  Year: Joi.number().integer().required(),
  SulphurDeficient: Joi.boolean().default(true).required(),
  Date: Joi.date().iso().allow(null),
  PH: Joi.number().precision(precisionEighteen).allow(null),
  PhosphorusMethodologyID: Joi.number().integer().allow(null),
  Phosphorus: Joi.number().precision(precisionOne).allow(null),
  PhosphorusIndex: Joi.number()
    .integer()
    .min(0)
    .max(maxTwoFiftyFive)
    .default(0)
    .allow(null),
  Potassium: Joi.number().integer().allow(null),
  PotassiumIndex: Joi.number()
    .integer()
    .min(minMinuesTwo)
    .max(precisionNine)
    .allow(null),
  PotassiumMethodologyID: Joi.number()
    .integer()
    .default(4)
    .required()
    .allow(null),
  Magnesium: Joi.number().integer().allow(null),
  MagnesiumMethodologyID: Joi.number()
    .integer()
    .default(4)
    .required()
    .allow(null),
  MagnesiumIndex: Joi.number()
    .integer()
    .min(0)
    .max(maxTwoFiftyFive)
    .default(0)
    .allow(null),
  SoilNitrogenSupply: Joi.number().integer().allow(null),
  SoilNitrogenSupplyIndex: Joi.number()
    .integer()
    .min(0)
    .max(maxTwoFiftyFive)
    .default(0)
    .allow(null),

  SoilNitrogenSampleDate: Joi.date().iso().allow(null),
  Sodium: Joi.number().integer().allow(null),
  Lime: Joi.number().precision(precisionThree).allow(null),
  PhosphorusStatus: Joi.string().max(maxTwentyValues).allow(null),

  PotassiumStatus: Joi.string().max(maxTwentyValues).allow(null),
  MagnesiumStatus: Joi.string().max(maxTwentyValues).allow(null),
  NitrogenResidueGroup: Joi.string().max(maxTwentyValues).allow(null),
  OrganicMatterPercentage: Joi.number().min(0).max(100).precision(1).optional().allow(null),
  Comments: Joi.string().max(maxTwoFiftyFive).allow(null),
  PreviousID: Joi.number().integer().allow(null),
  ...AuditFields,
});

const PreviousGrassesSchema = Joi.object({
  ID: Joi.number().integer().allow(null),
  FieldID: Joi.number().integer().required(),
  HasGrassInLastThreeYear: Joi.boolean().required(),
  HarvestYear: Joi.number().integer().allow(null),
  LayDuration: Joi.number().integer().allow(null),
  GrassManagementOptionID: Joi.number().integer().allow(null),
  HasGreaterThan30PercentClover: Joi.boolean().allow(null),
  SoilNitrogenSupplyItemID: Joi.number().integer().allow(null),
  ...AuditFields,
}).required();

const PreviousCroppingSchema = Joi.object({
  ID: Joi.number().integer().allow(null),
  FieldID: Joi.number().integer().required(),
  CropGroupID: Joi.number().integer().required(),
  CropTypeID: Joi.number().integer().required(),
  HasGrassInLastThreeYear: Joi.boolean().required(),
  HarvestYear: Joi.number().integer().allow(null),
  LayDuration: Joi.number().integer().allow(null),
  GrassManagementOptionID: Joi.number().integer().allow(null),
  HasGreaterThan30PercentClover: Joi.boolean().allow(null),
  SoilNitrogenSupplyItemID: Joi.number().integer().allow(null),
  ...AuditFields,
  Action: Joi.number().integer().allow(null).optional(),
}).required();
const PKBalanceSchema = Joi.object({
  Year: Joi.number().required(),
  FieldID: Joi.number().allow(null).optional(),
  PBalance: Joi.number().required(),
  KBalance: Joi.number().required(),
  PreviousID: Joi.number().allow(null).optional(),
  ...AuditFields,
});
// UpdateFieldDto Schema
const UpdateFieldDtoSchema = Joi.object({
  Field: FieldEntitySchema,
  SoilAnalysis: SoilAnalysisSchema.allow(null).optional(),
  // Crops: Joi.array()
  //   .items(CreateCropWithManagementPeriodsDto)
  //   .allow(null)
  //   .required(),
  PKBalance: PKBalanceSchema.allow(null).optional(),
  PreviousCroppings: Joi.array()
    .items(PreviousCroppingSchema)
    .allow(null)
    .optional(),
});

const CreateFieldWithSoilAnalysisAndCropsDto = Joi.object({
  Field: FieldEntitySchema,
  SoilAnalysis: SoilAnalysisSchema.allow(null).optional(),
  //Crops: Joi.array().items(CreateCropWithManagementPeriodsDto).required(),
  PKBalance: PKBalanceSchema.allow(null).optional(),
  PreviousCroppings: Joi.array()
    .items(PreviousCroppingSchema)
    .allow(null)
    .optional(),
});

module.exports = {
  FieldEntitySchema,
  UpdateFieldDtoSchema,
  CreateFieldWithSoilAnalysisAndCropsDto,
};
