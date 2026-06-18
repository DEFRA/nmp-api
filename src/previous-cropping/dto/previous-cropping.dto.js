const Joi = require('joi');

const PreviousCroppingDto = Joi.object({
  ID: Joi.number().integer().allow(null),
  FieldID: Joi.number().required(),
  CropGroupID: Joi.number().required(),
  CropTypeID: Joi.number().required(),
  HasGrassInLastThreeYear:Joi.bool().required(),
  HarvestYear: Joi.number().required(),
  LayDuration: Joi.number().required().optional().allow(null),
  GrassManagementOptionID: Joi.number().optional().allow(null),
  HasGreaterThan30PercentClover:Joi.bool().optional().allow(null),
  SoilNitrogenSupplyItemID: Joi.number().optional().allow(null),
  CreatedOn: Joi.date().allow(null),
  CreatedByID: Joi.number().allow(null),
  ModifiedOn: Joi.date().optional().allow(null),
  ModifiedByID: Joi.number().optional().allow(null),
});
const PreviousCroppingUpdateDto = PreviousCroppingDto.keys({
    ID: Joi.number().required()  
});
const PreviousCroppingPayloadDto = Joi.object({
    PreviousCroppingDto: PreviousCroppingUpdateDto.required()
});

const CreatePreviousCroppingDto = Joi.object({
  PreviousCroppings: Joi.array()
    .items(PreviousCroppingDto)  // Use the refactored object here
    .required()
});
  
module.exports = {
  CreatePreviousCroppingDto,
    PreviousCroppingPayloadDto
};
