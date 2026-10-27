const Joi = require("joi");
const { CreateMannerEstimationDto } = require("./create-manner-estimation.dto");
const {
  UpdateMannerEstimationApplicationDto,
} = require("../../manner-estimation-applications/dto/manner-estimation-applications.dto");

const positiveInteger = Joi.number().integer().positive();

const UpdateMannerEstimationByIdDto = CreateMannerEstimationDto.keys({
  ID: positiveInteger.required(),
});

const UpdateMannerEstimationApplicationByIdDto =
  UpdateMannerEstimationApplicationDto.keys({
    ID: positiveInteger.required(),
  });

const UpdateMannerEstimationWithApplicationsByIdDto = Joi.object({
  MannerEstimation: UpdateMannerEstimationByIdDto.required(),
  MannerEstimationApplications: Joi.array()
    .items(UpdateMannerEstimationApplicationByIdDto)
    .min(1)
    .required(),
});

module.exports = {
  UpdateMannerEstimationWithApplicationsByIdDto,
};
