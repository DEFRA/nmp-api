const Joi = require("joi");
const { StatusCodeMapper } = require("../constants/http-status-codes-mapper");
const { formatErrorResponse } = require("../interceptor/responseFormatter");
const { FarmsNVZController } = require("./farms-NVZ.controller");
const getController = (request, h) => new FarmsNVZController(request, h);

const baseOptions = {
  tags: ["api", "FarmsNVZ"],
};

const farmIdParamSchema = Joi.object({
  farmId: Joi.number().integer().required(),
})

 const commonFailAction = (request, h, err) => {
   return h
     .response(
       formatErrorResponse({
         source: {
           error: err,
         },
         request,
       }),
     )
     .code(StatusCodeMapper.BAD_REQUEST)
     .takeover();
 };       

module.exports = [
  {
    method: "GET",
    path: "/farmsNVZ/{farmId}",
    options: {
      ...baseOptions,
      description: "Get FarmsNVZ by Farm Id",
      validate: {
        params: farmIdParamSchema,
        failAction: commonFailAction
      },
    },
    handler: (request, h) => getController(request, h).getByFarmId(),
  },

  {
    method: "GET",
    path: "/farms-nvz-data/{farmId}",
    options: {
      ...baseOptions,
      description: "Get Farm And NVZ details by Farm Id",
      validate: {
        params: farmIdParamSchema,
        failAction: commonFailAction
      },
    },
    handler: (request, h) =>
      getController(request, h).getFarmAndNvzDetailsByFarmId(),
  },
];
