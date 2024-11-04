const Joi = require("joi");

// Define the schema using Joi for validation
const CreateRainfallPostApplicationDto = Joi.object({
  applicationDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // Regex for "YYYY-MM-DD" format
    .required()
    .label("Application Date")
    .messages({
      "string.pattern.base":
        '"applicationDate" must be in the format YYYY-MM-DD, e.g., "2024-10-28"',
    }),

  endOfSoilDrainageDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/) // Regex for "YYYY-MM-DD" format
    .required()
    .label("End of Soil Drainage Date")
    .messages({
      "string.pattern.base":
        '"endOfSoilDrainageDate" must be in the format YYYY-MM-DD, e.g., "2024-10-28"',
    }),

  climateDataPostcode: Joi.string().required().label("Climate Data Postcode"),
});

module.exports = {
  CreateRainfallPostApplicationDto,
};
