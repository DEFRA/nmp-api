const Joi = require("joi");

// Crop Schema
const CropDto = Joi.object({
  ID: Joi.number().integer().allow(null).optional(),
  FieldID: Joi.number().integer().allow(null).optional(),
  Year: Joi.number().integer().required(),
  CropTypeID: Joi.number().integer().allow(null),
  FieldType: Joi.number().integer().required(),
  Variety: Joi.string().max(100).allow(null),
  OtherCropName: Joi.string().max(128).allow(null),
  CropInfo1: Joi.number().integer().allow(null),
  CropInfo2: Joi.number().integer().allow(null),
  SowingDate: Joi.date().iso().allow(null),
  Yield: Joi.number().precision(3).allow(null),
  CropGroupName: Joi.string().max(120).allow(null),
  Confirm: Joi.boolean().required(),
  PreviousGrass: Joi.number().integer().allow(null),
  GrassHistory: Joi.number().integer().allow(null),
  Comments: Joi.string().allow(null),
  Establishment: Joi.number().integer().allow(null),
  LivestockType: Joi.number().integer().allow(null),
  MilkYield: Joi.number().allow(null).precision(3).default(0).allow(null),
  ConcentrateUse: Joi.number().allow(null).precision(3).default(0).allow(null),
  StockingRate: Joi.number().allow(null).precision(3).default(0).allow(null),
  DefoliationSequenceID: Joi.number()
    .integer()
    .allow(null)
    .default(0)
    .allow(null),
  GrazingIntensity: Joi.number().integer().allow(null).allow(null),
  SwardTypeID: Joi.number()
    .integer()
    .allow(null)
    .default(0)
    .allow(null),
    SwardManagementID: Joi.number()
    .integer()
    .allow(null)
    .default(0)
    .allow(null),
    PotentialCut: Joi.number()
    .integer()
    .allow(null)
    .default(0)
    .allow(null),
  PreviousID: Joi.number().integer().allow(null),
  CropOrder: Joi.number().integer().required(),
  CreatedOn: Joi.date().iso().allow(null).optional(),
  CreatedByID: Joi.number().integer().allow(null).optional(),
  ModifiedOn: Joi.date().iso().allow(null).optional(),
  ModifiedByID: Joi.number().integer().allow(null).optional(),
  FieldName: Joi.string().optional().allow(null),
  EncryptedCounter: Joi.number().integer().allow(null),
}).required();

const ManagementPeriodsDto = Joi.array()
  .items(
    Joi.object({
      ID: Joi.number().integer().allow(null).optional(),
      CropID: Joi.number().integer().allow(null).optional(),
      Defoliation: Joi.number().integer().allow(null).required(),
      Utilisation1ID: Joi.number().integer().allow(null).optional(),
      Utilisation2ID: Joi.number().integer().allow(null).optional(),
      Yield: Joi.number().allow(null).optional(),
      PloughedDown: Joi.date().iso().allow(null).required(),
      PreviousID: Joi.number().integer().allow(null).optional(),
      CreatedOn: Joi.date().iso().allow(null).optional(),
      CreatedByID: Joi.number().integer().allow(null).optional(),
      ModifiedOn: Joi.date().iso().allow(null).optional(),
      ModifiedByID: Joi.number().integer().allow(null).optional(),
    }).required()
  )
  .required();

const CropDtoWithFieldID = CropDto.keys({
  FieldID: Joi.number().integer().required(),
});

const CreatePlanDto = Joi.object({
  Crops: Joi.array()
    .items(
      Joi.object({
        Crop: CropDtoWithFieldID.required(),
        ManagementPeriods: ManagementPeriodsDto.required(),
      })
    )
    .required(),
});

const CreateCropWithManagementPeriodsDto = Joi.object({
  Crop: CropDto.required(),
  ManagementPeriods: ManagementPeriodsDto.required(),
}).required();

module.exports = {
  CropDto,
  CreatePlanDto,
  CreateCropWithManagementPeriodsDto,
  CreatePlanDto,
  CreateCropWithManagementPeriodsDto,
};
