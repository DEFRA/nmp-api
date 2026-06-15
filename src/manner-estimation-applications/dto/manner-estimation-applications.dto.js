const Joi = require("joi");

const CreateMannerEstimationApplicationDto = Joi.object({
  ID: Joi.number().integer().required().allow(null).default(null),   
  MannerEstimationID: Joi.number().integer().required().allow(null).default(null),
  ManureTypeID: Joi.number().integer().required(),
  ApplicationDate: Joi.date().required(),
  N: Joi.number().precision(3).required(),
  P2O5: Joi.number().precision(3).required(),
  K2O: Joi.number().precision(3).required(),
  MgO: Joi.number().precision(3).required(),
  SO3: Joi.number().precision(3).required(),
  DryMatterPercent: Joi.number().precision(2).required(),
  UricAcid: Joi.number().precision(2).required(),
  ApplicationRate: Joi.number().precision(1).required(),
  AreaSpread: Joi.number().precision(3).allow(null),
  ManureQuantity: Joi.number().precision(3).allow(null),
  IncorporationMethodID: Joi.number().integer().required(),
  IncorporationDelayID: Joi.number().integer().required(),
  WindspeedID: Joi.number().integer().required(),
  RainfallWithinSixHoursID: Joi.number().integer().required(),
  MoistureID: Joi.number().integer().required(),
  AutumnCropNitrogenUptake: Joi.number().integer().required(),
  EndOfDrainageDate: Joi.date().required(),
  RainfallPostApplication: Joi.number().integer().required(),
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null)
});



module.exports = { CreateMannerEstimationApplicationDto };
