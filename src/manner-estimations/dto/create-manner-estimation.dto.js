const Joi = require("joi");
const {
  CreateMannerEstimationApplicationDto,
} = require("../../manner-estimation-applications/dto/manner-estimation-applications.dto");
const maxTwoFifty = 250,maxFifty = 50,maxHundred=100;

const CreateMannerEstimationDto = Joi.object({
  ID: Joi.number().integer().allow(null).default(null),

  Name: Joi.string().max(maxTwoFifty).required(),

  OrganisationID: Joi.string().guid().required(),

  FarmName: Joi.string().max(maxTwoFifty).required(),

  CountryID: Joi.number().integer().required(),

  Postcode: Joi.string().max(maxFifty).required(),

  AverageAnuualRainfall: Joi.number().integer().required(),

  FieldName: Joi.string().max(maxFifty).required(),

  IsWithinNVZ: Joi.boolean().required(),

  NVZProgrammeID: Joi.number().integer().allow(null),

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

  NitrogenPrice: Joi.number().integer().required(),

  PhosphatePrice: Joi.number().integer().required(),

  PotashPrice: Joi.number().integer().required(),

  CalculateBasedOnNutrientPrice: Joi.boolean().default(true),

  CreatedOn: Joi.date().iso().allow(null).default(null),

  CreatedByID: Joi.number().integer().allow(null).default(null),

  ModifiedOn: Joi.date().iso().allow(null).default(null),

  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

const CreateMannerEstimationWithApplicationDto = Joi.object({
  MannerEstimation: CreateMannerEstimationDto.required(),
  MannerEstimationApplication: CreateMannerEstimationApplicationDto.required(),
});

const CheckMannerEstimationExistsDto = Joi.object({
  organisationId: Joi.string().guid().required(),
  name: Joi.string().max(maxTwoFifty).required(),
});

module.exports = {
  CreateMannerEstimationDto,
  CreateMannerEstimationWithApplicationDto,
  CheckMannerEstimationExistsDto,
};
