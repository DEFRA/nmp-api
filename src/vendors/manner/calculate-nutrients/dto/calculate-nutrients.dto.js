// ManureApplicationDto.js

const Joi = require("joi");

const FieldDto = Joi.object({
  fieldID: Joi.number().integer().required().description("ID of the field"),
  fieldName: Joi.string().required().description("Name of the field"),
  MannerCropTypeID: Joi.number()
    .integer()
    .required()
    .description("ID of the crop type"),
  topsoilID: Joi.number()
    .integer()
    .required()
    .description("ID of the topsoil type"),
  subsoilID: Joi.number()
    .integer()
    .required()
    .description("ID of the subsoil type"),
  isInNVZ: Joi.boolean()
    .required()
    .description("Indicates if the field is in NVZ"),
}).required();

const ManureDetailsDto = Joi.object({
  manureID: Joi.number().integer().required().description("ID of the manure"),
  name: Joi.string().required().description("Name of the manure"),
  isLiquid: Joi.boolean()
    .required()
    .description("Indicates if the manure is liquid"),
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

const ApplicationRateDto = Joi.object({
  value: Joi.number()
    .required()
    .description("Rate value of the manure application"),
  unit: Joi.string().required().description("Unit of the application rate"),
}).required();

const AutumnCropNitrogenUptakeDto = Joi.object({
  value: Joi.number()
    .required()
    .description("Nitrogen uptake value of the autumn crop"),
  unit: Joi.string().required().description("Unit of nitrogen uptake"),
}).required();

const ManureApplicationDto = Joi.object({
  manureDetails: ManureDetailsDto.required().description(
    "Details of the manure"
  ),
  applicationDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // Regex for YYYY-MM-DD format
    .required()
    .description("Date of the manure application in YYYY-MM-DD format"),
  applicationRate: ApplicationRateDto.required().description(
    "Rate of the manure application"
  ),
  applicationMethodID: Joi.number()
    .integer()
    .required()
    .description("ID of the application method"),
  incorporationMethodID: Joi.number()
    .integer()
    .required()
    .description("ID of the incorporation method"),
  incorporationDelayID: Joi.number()
    .integer()
    .required()
    .description("ID of the incorporation delay"),
  autumnCropNitrogenUptake: AutumnCropNitrogenUptakeDto.required().description(
    "Nitrogen uptake in autumn crop"
  ),
  endOfDrainageDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // Regex for YYYY-MM-DD format
    .required()
    .description("end of drainage in YYYY-MM-DD format"),
  rainfallPostApplication: Joi.number()
    .integer()
    .required()
    .description("Post-application rainfall amount"),
  cropNUptake: Joi.number()
    .integer()
    .required()
    .description("Crop nitrogen uptake amount"),
  windspeedID: Joi.number()
    .integer()
    .required()
    .description("ID of the windspeed condition"),
  rainTypeID: Joi.number()
    .integer()
    .required()
    .description("ID of the rain type"),
  topsoilMoistureID: Joi.number()
    .integer()
    .required()
    .description("ID of the topsoil moisture level"),
}).required();

const CreateManureApplicationDto = Joi.object({
  runType: Joi.number()
    .integer()
    .required()
    .description("Run type for the application"),
  postcode: Joi.string().required().description("Postcode of the location"),
  countryID: Joi.number().integer().required().description("ID of the country"),
  field: FieldDto.required().description("Details of the field"),
  manureApplications: Joi.array()
    .items(ManureApplicationDto)
    .required()
    .description("List of manure applications"),
}).required();

// Exporting the DTO schema for usage in Hapi routes
module.exports = {
  CreateManureApplicationDto,
  FieldDto,
  ManureDetailsDto,
  ApplicationRateDto,
  AutumnCropNitrogenUptakeDto,
  ManureApplicationDto,
};
