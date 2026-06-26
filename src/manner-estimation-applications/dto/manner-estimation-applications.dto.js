const Joi = require("joi");
const precisionThree = 3,
  precisionTwo = 2;
const CreateMannerEstimationApplicationDto = Joi.object({
  ID: Joi.number().integer().allow(null).default(null),

  MannerEstimationID: Joi.number().integer().allow(null).default(null),

  ManureTypeID: Joi.number().integer().required(),

  ApplicationDate: Joi.date().required(),

  N: Joi.number().precision(precisionThree).required(),

  P2O5: Joi.number().precision(precisionThree).required(),

  K2O: Joi.number().precision(precisionThree).required(),

  MgO: Joi.number().precision(precisionThree).required(),

  SO3: Joi.number().precision(precisionThree).required(),
  NH4N: Joi.number().precision(precisionThree).required(),

  NO3N: Joi.number().precision(precisionThree).required(),

  DryMatterPercent: Joi.number().precision(precisionTwo).required(),

  UricAcid: Joi.number().precision(precisionTwo).required(),

  ApplicationRate: Joi.number().precision(1).required(),

  AreaSpread: Joi.number().precision(precisionThree).allow(null),

  ManureQuantity: Joi.number().precision(precisionThree).allow(null),

  ApplicationMethodID: Joi.number().integer().required(),

  IncorporationMethodID: Joi.number().integer().required(),

  IncorporationDelayID: Joi.number().integer().required(),

  WindspeedID: Joi.number().integer().required(),

  RainfallWithinSixHoursID: Joi.number().integer().required(),

  MoistureID: Joi.number().integer().required(),

  AutumnCropNitrogenUptake: Joi.number().integer().required(),

  EndOfDrainageDate: Joi.date().required(),

  RainfallPostApplication: Joi.number().integer().required(),

  TotalN: Joi.number().integer().required(),

  CropAvailableNCurrentCrop: Joi.number().integer().required(),

  CropAvailableNitrogenFollowingCropYearTwo: Joi.number().integer().required(),

  TotalP2O5: Joi.number().integer().required(),

  CropAvailableP2O5: Joi.number().integer().required(),

  TotalSO3: Joi.number().integer().required(),

  TotalMgO: Joi.number().integer().required(),

  TotalK2O: Joi.number().integer().required(),

  CropAvailableK2O: Joi.number().integer().required(),

  NitrogenUseEfficiency: Joi.number().integer().allow(null),

  MineralisedNitrogenLosses: Joi.number().integer().required(),

  LostNitrateLosses: Joi.number().integer().required(),

  LostAmmonia: Joi.number().integer().required(),

  LostDenitrified: Joi.number().integer().required(),

  NitrogenValue: Joi.number().integer().required(),

  PhosphateValue: Joi.number().integer().required(),

  PotashValue: Joi.number().integer().required(),

  CreatedOn: Joi.date().iso().allow(null).default(null),

  CreatedByID: Joi.number().integer().allow(null).default(null),

  ModifiedOn: Joi.date().iso().allow(null).default(null),

  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

module.exports = {
  CreateMannerEstimationApplicationDto,
};
