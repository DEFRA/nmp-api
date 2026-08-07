const Joi = require("joi");
const {
  CreateMannerEstimationDto,
} = require("../../manner-estimations/dto/create-manner-estimation.dto");
const {
  CreateMannerEstimationApplicationDto,
} = require("../../manner-estimation-applications/dto/manner-estimation-applications.dto");

const maxTwoFifty = 250,
  maxFifty = 50;

const CreateMannerFarmDto = Joi.object({
  ID: Joi.number().integer().allow(null).default(null),

  Name: Joi.string().max(maxTwoFifty).required(),

  OrganisationID: Joi.string().guid().required(),

  FarmName: Joi.string().max(maxTwoFifty).required(),

  CountryID: Joi.number().integer().required(),

  Postcode: Joi.string().max(maxFifty).required(),

  AverageAnuualRainfall: Joi.number().integer().required(),
  RegisteredOrganicProducer: Joi.boolean().required(),
  CreatedOn: Joi.date().iso().allow(null).default(null),

  CreatedByID: Joi.number().integer().allow(null).default(null),

  ModifiedOn: Joi.date().iso().allow(null).default(null),

  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

const CreateMannerFarmWithEstimationDto = Joi.object({
  MannerFarm: CreateMannerFarmDto.required(),
  MannerEstimation: CreateMannerEstimationDto.required(),
  MannerEstimationApplication: CreateMannerEstimationApplicationDto.required(),
});

module.exports = {
  CreateMannerFarmDto,
  CreateMannerFarmWithEstimationDto,
};
