const Joi = require("joi");
const { WarningMessageItemSchema } = require("../../organic-manure/dto/organic-manure.dto");
const precsionThree = 3;
const FertiliserManureDto = Joi.object({
  ID: Joi.number().integer().allow(null).optional().default(null),
  ManagementPeriodID: Joi.number().integer().required(),
  ApplicationDate: Joi.date().iso().required(),
  ApplicationRate: Joi.number().precision(precsionThree).required(),
  Confirm: Joi.boolean().required(),
  N: Joi.number().precision(precsionThree).required(),
  P2O5: Joi.number().precision(precsionThree).required(),
  K2O: Joi.number().precision(precsionThree).required(),
  MgO: Joi.number().precision(precsionThree).required(),
  SOprecsionThree: Joi.number().precision(precsionThree).required(),
  Na2O: Joi.number().precision(precsionThree).required(),
  NFertAnalysisPercent: Joi.number().precision(precsionThree).required(),
  P2O5FertAnalysisPercent: Joi.number().precision(precsionThree).required(),
  K2OFertAnalysisPercent: Joi.number().precision(precsionThree).required(),
  MgOFertAnalysisPercent: Joi.number().precision(precsionThree).required(),
  SOprecsionThreeFertAnalysisPercent: Joi.number().precision(precsionThree).required(),
  Na2OFertAnalysisPercent: Joi.number().precision(precsionThree).required(),
  Lime: Joi.number().precision(precsionThree).required(),
  NH4N: Joi.number().precision(precsionThree).required(),
  NOprecsionThreeN: Joi.number().precision(precsionThree).required(),
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
