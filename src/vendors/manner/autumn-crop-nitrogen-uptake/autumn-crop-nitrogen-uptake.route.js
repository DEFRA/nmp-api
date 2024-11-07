// mannerRoutes.js

const MannerAutumnCropNitorgenUptakeController = require("./autumn-crop-nitrogen-uptake.controller");
const { CreateAutumnCropUptakeNitrogenDto } = require("./dto/autumn-crop-nitrogen-uptake.dto");


module.exports = [
  {
    method: "POST",
    path: "/vendors/manner/autumn-crop-nitrogen-uptake",
    handler: async (request, h) => {
      // Create a new instance of the controller for each request
      const controller = new MannerAutumnCropNitorgenUptakeController(
        request,
        h
      );
      return controller.createAutoCropNitrogenUptake();
    },
    options: {
      tags: ["api", "Manner autumn-crop-nitrogen-uptake"],
      description: "Get Autumn Crop Nitrogen Uptake",
      validate: {
        payload: CreateAutumnCropUptakeNitrogenDto,
      },
    },
  },
];
