const Joi = require("joi");

const ExcessRainfallDto = Joi.object({
  ExcessRainfall: Joi.number().integer().default(0).allow(null), 
  WinterRainfall: Joi.number().integer().allow(null), 
  CreatedOn: Joi.date().iso().allow(null).default(null), 
  CreatedByID: Joi.number().integer().allow(null).default(null), 
  ModifiedOn: Joi.date().iso().allow(null).default(null), 
  ModifiedByID: Joi.number().integer().allow(null).default(null), 
});

module.exports = {
  ExcessRainfallDto,
};
