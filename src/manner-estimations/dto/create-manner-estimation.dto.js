const Joi = require("joi");
const {
  CreateMannerEstimationApplicationDto,
} = require("../../manner-estimation-applications/dto/manner-estimation-applications.dto");
const { CreateMannerFinancialValuesDto } = require("../../manner-financial-values/dto/manner-financial-values.dto");
const maxTwoFifty = 250;
const maxFifty = 50;

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

  CreatedOn: Joi.date().iso().allow(null).default(null),

  CreatedByID: Joi.number().integer().allow(null).default(null),

  ModifiedOn: Joi.date().iso().allow(null).default(null),

  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

const CreateMannerEstimationWithApplicationDto = Joi.object({
  MannerEstimation: CreateMannerEstimationDto.required(),
  MannerEstimationApplication: CreateMannerEstimationApplicationDto.required(),
  MannerEstimationFinancialValues: CreateMannerFinancialValuesDto.required()
});

const CheckMannerEstimationExistsDto = Joi.object({
  organisationId: Joi.string().guid().required(),
  name: Joi.string().max(maxTwoFifty).required(),
});

module.exports = {
  CreateMannerEstimationDto,
  CreateMannerFinancialValuesDto,
  CreateMannerEstimationWithApplicationDto,
  CheckMannerEstimationExistsDto,
};
