const Joi = require("joi");
const {
  RB209PreviousCroppingController,
} = require("./previousCropping.controller");
const {
  formatErrorResponse,
} = require("../../../interceptor/responseFormatter");

module.exports = [
  {
    method: "GET",
    path: "/vendors/rb209/PreviousCropping/PreviousGrasses",
    handler: async (request, h) => {
      const controller = new RB209PreviousCroppingController(request, h);
      return controller.getPreviousGrasses(request, h);
    },
    options: {
      tags: ["api", "RB209 PreviousCropping"],
      description: "The full list of available Previous Grasses",
    },
  },
  {
    method: "GET",
    path: "/vendors/rb209/PreviousCropping/PreviousGrass/{previousGrassId}",
    handler: async (request, h) => {
      const controller = new RB209PreviousCroppingController(request, h);
      return controller.getPreviousGrassByPreviousGrassId(request, h);
    },
    options: {
      tags: ["api", "RB209 PreviousCropping"],
      description: "Individual Previous Grass - filtered by Previous Grass Id",
      validate: {
        params: Joi.object({
          previousGrassId: Joi.string().required(),
        }),
        failAction: (request, h, err) => {
          return h
            .response(
              formatErrorResponse({
                source: {
                  error: err,
                },
                request,
              })
            )
            .code(400)
            .takeover();
        },
      },
    },
  },
];
