const Joi = require('joi');

const PKBalanceDto = Joi.object({
  ID: Joi.number().integer().allow(null),
  Year: Joi.number().required(),
  FieldID: Joi.number().required(),
  PBalance: Joi.number().required(),
  KBalance: Joi.number().required(),
  PreviousID:Joi.number().optional().allow(null),
  CreatedOn: Joi.date().allow(null),
  CreatedByID: Joi.number().allow(null),
  ModifiedOn: Joi.date().optional().allow(null),
  ModifiedByID: Joi.number().optional().allow(null),
});
const PKBalanceUpdateDto = PKBalanceDto.keys({
    ID: Joi.number().required()  
});
const PKBalanceUpdatePayloadDto = Joi.object({
    PKBalanceDto: PKBalanceUpdateDto.required()
});

const CreatePKBalanceDto = Joi.object({
    PKBalance: PKBalanceDto.required(),
  });
  
module.exports = {
  CreatePKBalanceDto,
    PKBalanceUpdatePayloadDto
};
