// CalculateNutrientsByDryMatterDto.js

const Joi = require("joi");

const nutrientFieldDescriptions = {
  totalN: "Total nitrogen in the manure",
  nH4N: "NH4N content in the manure",
  uric: "Uric acid content in the manure",
  nO3N: "NO3N content in the manure",
  p2O5: "P2O5 content in the manure",
  k2O: "K2O content in the manure",
  sO3: "SO3 content in the manure",
  mgO: "MgO content in the manure",
};

const NutrientFieldsDto = Object.fromEntries(
  Object.entries(nutrientFieldDescriptions).map(([fieldName, description]) => [
    fieldName,
    Joi.number().required().description(description),
  ]),
);

const CalculateNutrientsByDryMatterDto = Joi.object({
  id: Joi.number().integer().required().description("ID of the manure"),

  dryMatter: Joi.number()
    .required()
    .description("Dry matter percentage of the manure"),

  ...NutrientFieldsDto,
}).required();

module.exports = {
  CalculateNutrientsByDryMatterDto,
};
