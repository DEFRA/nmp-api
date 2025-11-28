const Joi = require('joi');

const WarningMessageDto = Joi.object({
  ID: Joi.number().integer().allow(null),
  FieldID: Joi.number().required(),
  CropID: Joi.number().required(),
  JoiningID: Joi.number().required(),
  Header:Joi.string().required(),
  Para1: Joi.string().optional().allow(null),
  Para2: Joi.string().optional().allow(null),
  Para3: Joi.string().optional().allow(null),
  WarningCodeID: Joi.number().required().optional().allow(null),
  WarningLevelID:Joi.number().required().optional().allow(null),
  CreatedOn: Joi.date().allow(null),
  CreatedByID: Joi.number().allow(null),
  ModifiedOn: Joi.date().optional().allow(null),
  ModifiedByID: Joi.number().optional().allow(null),
  PreviousID: Joi.number().optional().allow(null),
});

  
module.exports = {
 WarningMessageDto
};
