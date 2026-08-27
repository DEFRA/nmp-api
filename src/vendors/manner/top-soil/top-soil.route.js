const Joi = require("joi");
const MannerTopSoilsController = require("./top-soil.controller");

const manngerServiceTag = "Manner Soils";

const idValidation = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
};

const createHandler = (methodName) => async (request, h) => {
  const controller = new MannerTopSoilsController(request, h);
  return controller[methodName](request, h);
};

module.exports = [
  {
    method: "GET",
    path: "/vendors/manner/top-soils",
    handler: createHandler("getAllSoils"),
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve all top-soils",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/top-soils/{id}",
    handler: createHandler("getSoilsById"),
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve top-soil by Id",
      validate: idValidation,
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/sub-soils",
    handler: createHandler("getAllSoils"),
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve all sub-soils",
    },
  },
  {
    method: "GET",
    path: "/vendors/manner/sub-soils/{id}",
    handler: createHandler("getSoilsById"),
    options: {
      tags: ["api", manngerServiceTag],
      description: "Retrieve sub-soil by Id",
      validate: idValidation,
    },
  },
];
