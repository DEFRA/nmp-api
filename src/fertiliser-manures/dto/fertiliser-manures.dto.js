const Joi = require("joi");
const { WarningMessageItemSchema } = require("../../organic-manure/dto/organic-manure.dto");
const precisionThree = 3;
const FertiliserManureDto = Joi.object({
  ID: Joi.number().integer().allow(null).optional().default(null),
  ManagementPeriodID: Joi.number().integer().required(),
  ApplicationDate: Joi.date().iso().required(),
  ApplicationRate: Joi.number().precision(precisionThree).required(),
  Confirm: Joi.boolean().required(),
  N: Joi.number().precision(precisionThree).required(),
  P2O5: Joi.number().precision(precisionThree).required(),
  K2O: Joi.number().precision(precisionThree).required(),
  MgO: Joi.number().precision(precisionThree).required(),
  SOprecisionThree: Joi.number().precision(precisionThree).required(),
  Na2O: Joi.number().precision(precisionThree).required(),
  NFertAnalysisPercent: Joi.number().precision(precisionThree).required(),
  P2O5FertAnalysisPercent: Joi.number().precision(precisionThree).required(),
  K2OFertAnalysisPercent: Joi.number().precision(precisionThree).required(),
  MgOFertAnalysisPercent: Joi.number().precision(precisionThree).required(),
  SOprecisionThreeFertAnalysisPercent: Joi.number().precision(precisionThree).required(),
  Na2OFertAnalysisPercent: Joi.number().precision(precisionThree).required(),
  Lime: Joi.number().precision(precisionThree).required(),
  NH4N: Joi.number().precision(precisionThree).required(),
  NOprecisionThreeN: Joi.number().precision(precisionThree).required(),
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
