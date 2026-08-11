const { validationFailAction } = require("../shared/validateFailSafeAction");
const { MannerFarmsController } = require("./manner-farms.controller");
const {
  CreateMannerFarmWithEstimationDto,
  UpdateMannerFarmWithEstimationsDto,
} = require("./dto/manner-farm.dto");
const Joi = require("joi");
const mannerFarms = "Manner Farms";
module.exports = [
  {
    method: "POST",
    path: "/manner-farms/create-with-estimation",
    options: {
      tags: ["api", mannerFarms],
      description:
        "Create Manner Farm with Manner Estimation and Manner Estimation Application",
      validate: {
        payload: CreateMannerFarmWithEstimationDto,
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerFarmsController(request, h);
      return controller.createWithMannerEstimation();
    },
  },
  {
    method: "PUT",
    path: "/manner-farms",
    options: {
      tags: ["api", mannerFarms],
      description:
        "Update Manner Farm and refresh linked Manner Estimations and applications",
      validate: {
        payload: UpdateMannerFarmWithEstimationsDto,
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerFarmsController(request, h);
      return controller.updateWithAssociatedEstimations();
    },
  },
  {
    method: "GET",
    path: "/manner-farms/manner-farms-by-id/{id}",
    options: {
      tags: ["api", mannerFarms],
      description: "Get Manner Farms by ID",
      validate: {
        params: Joi.object({
          id: Joi.number().integer().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerFarmsController(request, h);
      return controller.getById();
    },
  },
  {
    method: "GET",
    path: "/manner-farms/{organisationId}",
    options: {
      tags: ["api", mannerFarms],
      description: "Get Manner Farms by Organisation ID",
      validate: {
        params: Joi.object({
          organisationId: Joi.string().guid().required(),
        }),
        failAction: validationFailAction,
      },
    },
    handler: async (request, h) => {
      const controller = new MannerFarmsController(request, h);
      return controller.getByOrganisationId();
    },
  },
];
