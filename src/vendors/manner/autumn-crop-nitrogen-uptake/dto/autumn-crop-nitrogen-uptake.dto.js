const Joi = require("joi");

// Create the validation schema for the DTO
const CreateAutumnCropUptakeNitrogenDto = Joi.object({
  cropTypeId: Joi.number().integer().required(), // Equivalent of @IsInt() and the type number
  applicationMonth: Joi.number().integer().required(), // Equivalent of @IsInt() and the type number
});

module.exports = { CreateAutumnCropUptakeNitrogenDto };
