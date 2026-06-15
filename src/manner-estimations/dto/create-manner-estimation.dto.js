const Joi = require("joi");
const { CreateMannerEstimationApplicationDto } = require("../../manner-estimation-applications/dto/manner-estimation-applications.dto");

const CreateMannerEstimationDto = Joi.object({
  ID: Joi.number().integer().required().allow(null).default(null),   
  Name: Joi.string().max(250).required(),
  FarmName: Joi.string().max(250).required(),
  CountryID: Joi.number().integer().required(),
  Postcode: Joi.string().max(50).required(),
  AverageAnuualRainfall: Joi.number().integer().required(),
  FieldName: Joi.string().max(250).required(),
  IsWithinNVZ: Joi.boolean().required(),
  NVZProgrammeID: Joi.number().integer().allow(null),
  SoilTypeID: Joi.number().integer().required(),
  CropTypeID: Joi.number().integer().required(),
  IsEarlySown: Joi.boolean().allow(null),
  FieldComments: Joi.string().max(250).allow(null),
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null)
});

const CreateMannerEstimationWithApplicationDto = Joi.object({
  MannerEstimation: CreateMannerEstimationDto.required(),
  MannerEstimationApplication: CreateMannerEstimationApplicationDto.required(),
});

module.exports = {
  CreateMannerEstimationDto,
  CreateMannerEstimationWithApplicationDto
};
