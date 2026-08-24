// CalculateNutrientsByDryMatterDto.js

const Joi = require("joi");

const CalculateNutrientsByDryMatterDto = Joi.object({
  id: Joi.number().integer().required().description("ID of the manure"),

  dryMatter: Joi.number()
    .required()
    .description("Dry matter percentage of the manure"),

  totalN: Joi.number().required().description("Total nitrogen in the manure"),

  nH4N: Joi.number().required().description("NH4N content in the manure"),

  uric: Joi.number().required().description("Uric acid content in the manure"),

  nO3N: Joi.number().required().description("NO3N content in the manure"),

  p2O5: Joi.number().required().description("P2O5 content in the manure"),

  k2O: Joi.number().required().description("K2O content in the manure"),

  sO3: Joi.number().required().description("SO3 content in the manure"),

  mgO: Joi.number().required().description("MgO content in the manure"),
}).required();

module.exports = {
  CalculateNutrientsByDryMatterDto,
};
