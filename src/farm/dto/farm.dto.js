const Joi = require('joi');

const FarmDto = Joi.object({
  ID: Joi.number().integer().allow(null).optional(),
  FullAddress: Joi.string().allow(null, ""),
  OrganisationID: Joi.string().required(),
  Name: Joi.string().required(),
  Address1: Joi.string().required().allow(null),
  Address2: Joi.string().optional().allow(null),
  Address3: Joi.string().optional().allow(null),
  Address4: Joi.string().optional().allow(null),
  Postcode: Joi.string().required(),
  CPH: Joi.string().optional().allow(null),
  FarmerName: Joi.string().required().allow(null),
  BusinessName: Joi.string().required().allow(null),
  SBI: Joi.string().required().allow(null),
  STD: Joi.string().required().allow(null),
  Telephone: Joi.string().optional().allow(null),
  Mobile: Joi.string().optional().allow(null),
  Email: Joi.string().required().allow(null),
  Rainfall: Joi.number().required().allow(null),
  TotalFarmArea: Joi.number().required(),
  AverageAltitude: Joi.number().required(),
  RegisteredOrganicProducer: Joi.boolean().required(),
  MetricUnits: Joi.boolean().required(),
  EnglishRules: Joi.boolean().required(),
  NVZFields: Joi.number().required(),
  FieldsAbove300SeaLevel: Joi.number().required(),
  EncryptedFarmId: Joi.string().optional().allow(null),
  CountryID: Joi.number().required(),
  ClimateDataPostCode: Joi.string().required(),
  CreatedOn: Joi.date().allow(null),
  CreatedByID: Joi.number().allow(null),
  ModifiedOn: Joi.date().allow(null),
  ModifiedByID: Joi.date().allow(null),
});
const FarmUpdateDto = FarmDto.keys({
    ID: Joi.number().required()  
});
const FarmPayloadDto = Joi.object({
    Farm: FarmDto.required(),
    UserID: Joi.number().optional().allow(null), 
    RoleID: Joi.number().optional().allow(null) 
});

const FarmUpdatePayloadDto = Joi.object({
    Farm: FarmUpdateDto.required()
});

module.exports = {
    FarmDto,
    FarmPayloadDto,
    FarmUpdatePayloadDto
};
