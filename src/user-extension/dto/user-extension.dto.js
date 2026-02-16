const Joi = require("joi");

const updateIsTermsOfUseAcceptedDto = Joi.object({
  IsTermsOfUseAccepted: Joi.boolean().required().default(false),
});
const updateDoNotShowAboutThisServiceDto = Joi.object({
  DoNotShowAboutThisService: Joi.boolean().required().default(false),
});
const doNotShowAboutMannerDto= Joi.object({
  DoNotShowAboutManner: Joi.boolean().required().default(false),
});


module.exports = {
  updateIsTermsOfUseAcceptedDto,
  updateDoNotShowAboutThisServiceDto,
  doNotShowAboutMannerDto
};
