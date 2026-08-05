const Joi = require("joi");

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

  ModifiedByID: Joi.number().integer().allow(null).default(null)
});

module.exports = {
  CreateMannerFarmDto
};
