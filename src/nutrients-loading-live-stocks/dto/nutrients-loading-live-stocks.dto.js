const Joi = require("joi");

const createNutrientsLoadingLiveStocks = Joi.object({
  ID: Joi.number().integer().optional().allow(null).default(null),
  FarmID: Joi.number().required(),
  CalendarYear: Joi.number().required().allow(null).optional(),
  LiveStockTypeID: Joi.number().allow(null),
  Units: Joi.number().precision(3).allow(null),
  NByUnit: Joi.number().precision(3).allow(null),
  TotalNProduced: Joi.number().precision(3).allow(null),
  Occupancy: Joi.number().allow(null),
  PByUnit: Joi.number().allow(null),
  TotalPProduced: Joi.number().allow(null),
  Jan: Joi.number().allow(null),
  Feb: Joi.number().allow(null),
  Mar: Joi.number().allow(null),
  Apr: Joi.number().allow(null),
  May: Joi.number().allow(null),
  June: Joi.number().allow(null),
  July: Joi.number().allow(null),
  Aug: Joi.number().allow(null),
  Sep: Joi.number().allow(null),
  Oct: Joi.number().allow(null),
  Nov: Joi.number().allow(null),
  Dec: Joi.number().allow(null),
  CreatedOn: Joi.date().iso().allow(null).default(null),
  CreatedByID: Joi.number().integer().allow(null).default(null),
  ModifiedOn: Joi.date().iso().allow(null).default(null),
  ModifiedByID: Joi.number().integer().allow(null).default(null),
});

module.exports = { createNutrientsLoadingLiveStocks };
