const Joi = require("joi");


const StoreCapacitiesCreateDto = Joi.object({
  ID: Joi.number().integer().optional().allow(null).default(null),
  FarmID: Joi.number().integer().required().default(null),
  Year: Joi.number().integer().required(),
  StoreName: Joi.string().max(128).required(),
  MaterialStateID: Joi.number().integer().required(),
  StorageTypeID: Joi.number().integer().optional().allow(null),
  SolidManureTypeID: Joi.number().integer().optional().allow(null),
  Length: Joi.number().precision(3).optional().allow(null),
  Width: Joi.number().precision(3).optional().allow(null),
  Depth: Joi.number().precision(3).optional().allow(null),
  Circumference: Joi.number().precision(3).optional().allow(null),
  Diameter: Joi.number().precision(3).optional().allow(null),
  BankSlopeAngleID: Joi.number().integer().optional().allow(null),
  IsCovered: Joi.boolean().optional().allow(null),
  CapacityVolume: Joi.number().precision(3).optional().allow(null),
  CapacityWeight: Joi.number().precision(3).optional().allow(null),
  SurfaceArea: Joi.number().precision(3).optional().allow(null),
    CreatedOn: Joi.date().iso().allow(null).default(null),
    CreatedByID: Joi.number().integer().allow(null).default(null),
    ModifiedOn: Joi.date().iso().allow(null).default(null),
    ModifiedByID: Joi.number().integer().allow(null).default(null),
  PreviousID: Joi.number().integer().optional().allow(null),
});

module.exports = { StoreCapacitiesCreateDto };
