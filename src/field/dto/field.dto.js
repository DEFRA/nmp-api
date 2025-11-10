const Joi = require("joi");
const {
  CreateCropWithManagementPeriodsDto,
} = require("../../crop/dto/crops.dto");

const FieldEntitySchema = Joi.object({
  ID: Joi.number().integer().allow(null),
  SoilTypeID: Joi.number().integer().optional(),
  NVZProgrammeID: Joi.number().integer().optional(),
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
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
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
  PH: Joi.number().precision(18).allow(null),
  PhosphorusMethodologyID: Joi.number().integer().allow(null),
  Phosphorus: Joi.number().integer().allow(null),
  PhosphorusIndex: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .default(0)
    .allow(null),
  Potassium: Joi.number().integer().allow(null),
  PotassiumIndex: Joi.number().integer().min(-2).max(9).allow(null),
  Magnesium: Joi.number().integer().allow(null),
  MagnesiumIndex: Joi.number().integer().min(0).max(255).default(0).allow(null),
  SoilNitrogenSupply: Joi.number().integer().allow(null),
  SoilNitrogenSupplyIndex: Joi.number()
    .integer()
    .min(0)
    .max(255)
    .default(0)
    .allow(null),

  SoilNitrogenSampleDate: Joi.date().iso().allow(null),
  Sodium: Joi.number().integer().allow(null),
  Lime: Joi.number().precision(3).allow(null),
  PhosphorusStatus: Joi.string().max(20).allow(null),
  PotassiumAnalysis: Joi.string().max(50).allow(null),
  PotassiumStatus: Joi.string().max(20).allow(null),
  MagnesiumAnalysis: Joi.string().max(20).allow(null),
  MagnesiumStatus: Joi.string().max(20).allow(null),
  NitrogenResidueGroup: Joi.string().max(20).allow(null),
  Comments: Joi.string().max(255).allow(null),
  PreviousID: Joi.number().integer().allow(null),
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
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
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
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
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
  Action: Joi.number().integer().allow(null).optional()
}).required();
const PKBalanceSchema = Joi.object({
  Year: Joi.number().required(),
  FieldID: Joi.number().allow(null).optional(),
  PBalance: Joi.number().required(),
  KBalance: Joi.number().required(),
  PreviousID:Joi.number().allow(null).optional(),
  CreatedOn: Joi.date().iso().allow(null),
  CreatedByID: Joi.number().integer().allow(null),
  ModifiedOn: Joi.date().iso().allow(null),
  ModifiedByID: Joi.number().integer().allow(null),
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
  UpdateFieldDtoSchema,
  CreateFieldWithSoilAnalysisAndCropsDto,
};
