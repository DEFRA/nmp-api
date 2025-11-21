const Joi = require("joi");
const { WarningMessageItemSchema } = require("../../organic-manure/dto/organic-manure.dto");

const FertiliserManureDto = Joi.object({
  ID: Joi.number().integer().allow(null).optional().default(null),
  ManagementPeriodID: Joi.number().integer().required(),
  ApplicationDate: Joi.date().iso().required(),
  ApplicationRate: Joi.number().precision(3).required(),
  Confirm: Joi.boolean().required(),
  N: Joi.number().precision(3).required(),
  P2O5: Joi.number().precision(3).required(),
  K2O: Joi.number().precision(3).required(),
  MgO: Joi.number().precision(3).required(),
  SO3: Joi.number().precision(3).required(),
  Na2O: Joi.number().precision(3).required(),
  NFertAnalysisPercent: Joi.number().precision(3).required(),
  P2O5FertAnalysisPercent: Joi.number().precision(3).required(),
  K2OFertAnalysisPercent: Joi.number().precision(3).required(),
  MgOFertAnalysisPercent: Joi.number().precision(3).required(),
  SO3FertAnalysisPercent: Joi.number().precision(3).required(),
  Na2OFertAnalysisPercent: Joi.number().precision(3).required(),
  Lime: Joi.number().precision(3).required(),
  NH4N: Joi.number().precision(3).required(),
  NO3N: Joi.number().precision(3).required(),
  // FieldName: Joi.string().optional().allow(null),
  // EncryptedCounter: Joi.string().optional().allow(null),
  // Defoliation: Joi.number().integer().optional().allow(null),
  // FieldID: Joi.number().integer().allow(null),
  // DefoliationName: Joi.string().optional().allow(null)
}).required();


const FertiliserManureDtoSchema = Joi.object({
  FertiliserManure: FertiliserManureDto.required(),
  WarningMessages: Joi.array()
    .items(WarningMessageItemSchema)
    .min(1)
    .optional()
    .allow(null),
});

const CreateFertiliserManuresDto = Joi.object({
  FertiliserManure: Joi.array().items(FertiliserManureDtoSchema).required(),
});
const UpdateFertiliserManuresDto = Joi.object({
  FertiliserManure: Joi.array().items(FertiliserManureDto).required(),
});


module.exports = {
  CreateFertiliserManuresDto,
  UpdateFertiliserManuresDto
};
