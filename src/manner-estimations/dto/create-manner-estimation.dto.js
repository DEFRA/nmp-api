const Joi = require("joi");
const {
  CreateMannerEstimationApplicationDto,
} = require("../../manner-estimation-applications/dto/manner-estimation-applications.dto");
const { CreateMannerFarmDto } = require("../../manner-farm/dto/manner-farm.dto");
const maxTwoFifty = 250,
  maxFifty = 50,
  maxHundred = 100;
const precisionTwo = 2;

const CreateMannerEstimationDto = Joi.object({
  ID: Joi.number().integer().allow(null).default(null),

  Name: Joi.string().max(maxTwoFifty).required(),

  FarmID: Joi.number().integer(),

  FieldName: Joi.string().max(maxFifty).required(),

  IsWithinNVZ: Joi.boolean().required(),

  TopSoilID: Joi.number().integer().required(),

  SubSoilID: Joi.number().integer().required(),

  CropTypeID: Joi.number().integer().required(),

  MannerCropTypeID: Joi.number().integer().required(),

  SowingDate: Joi.date().iso().allow(null),

  NitrogenProductId: Joi.number().integer().required(),

  PhosphateProductId: Joi.number().integer().required(),

  PotashProductId: Joi.number().integer().required(),

  NitrogenProductName: Joi.string().max(maxHundred).allow("").required(),

  PhosphateProductName: Joi.string().max(maxHundred).allow("").required(),

  PotashProductName: Joi.string().max(maxHundred).allow("").required(),

  NitrogenProductPrice: Joi.number().integer().required(),

  PhosphateProductPrice: Joi.number().integer().required(),

  PotashProductPrice: Joi.number().integer().required(),

  NitrogenPrice: Joi.number().precision(precisionTwo).required(),

  PhosphatePrice: Joi.number().precision(precisionTwo).required(),

  PotashPrice: Joi.number().precision(precisionTwo).required(),

  IsPotashPriceBasedOnNutrientPrice: Joi.boolean().default(true),
  IsPhosphatePriceBasedOnNutrientPrice: Joi.boolean().default(true),
  IsNitrogenPriceBasedOnNutrientPrice: Joi.boolean().default(true),

  CreatedOn: Joi.date().iso().allow(null).default(null),

  CreatedByID: Joi.number().integer().allow(null).default(null),

  ModifiedOn: Joi.date().iso().allow(null).default(null),

  ModifiedByID: Joi.number().integer().allow(null).default(null),
});


const CreateMannerEstimationWithApplicationDto = Joi.object({
  MannerFarm:CreateMannerFarmDto.required(),
  MannerEstimation: CreateMannerEstimationDto.required(),
  MannerEstimationApplication: CreateMannerEstimationApplicationDto.required(),
});

const UpdateMannerEstimationDto = CreateMannerEstimationDto.keys({
  ID: Joi.number().integer().required(),
});

const UpdateMannerEstimationOnlyDto = Joi.object({
  MannerEstimation: UpdateMannerEstimationDto.required(),
});

const CheckMannerEstimationExistsDto = Joi.object({
  organisationId: Joi.string().guid().required(),
  name: Joi.string().max(maxTwoFifty).required(),
});
const CopyMannerEstimationDto = Joi.object({
  ID: Joi.number().integer().required(),
  Name: Joi.string().max(maxTwoFifty).required(),
});

module.exports = {
  CreateMannerEstimationDto,
  CreateMannerEstimationWithApplicationDto,
  UpdateMannerEstimationOnlyDto,
  CheckMannerEstimationExistsDto,
  CopyMannerEstimationDto,
};
