module.exports = [
  ...require("./health-check/health-check.route"),
  ...require("./vendors/rb209/rb209.routes"),
  ...require("./vendors/manner/manner.route"),
  ...require("./vendors/address-lookup/address-lookup.route"),
  ...require("./user/user.route"),
  ...require("./farm/farm.route"),
  ...require("./field/field.route"),
  ...require("./moisture-type/moisture-type.route"),
  ...require("./climate/climate.route"),
  ...require("./rain-types/rain-types.route"),
  ...require("./incorporation-delay/incorporation-delay.route"),
  ...require("./manure-type/manure-type.route"),
  ...require("./management-period/management-period.route"),
  ...require("./incorporation-method/incorporation-method.route"),
  ...require("./crop/crop.route"),
  ...require("./manure-group/manure-group.route"),
  ...require("./wind-speed/wind-speed.route"),
  ...require("./soil-analysis/soil-analysis.route"),
  ...require("./manner-crop-type/manner-crop-type.route"),
  ...require("./application-method/application-method.route"),
  ...require("./recommendation/recommendation.route"),
  ...require("./organic-manure/organic-manure.route"),
  ...require("./fertiliser-manures/fertiliser-manures.route"),
  ...require("./inorganic-manure-duration/inorganic-manure-duration.route"),
  ...require("./crop-type-linking/crop-type-linking.route"),
  ...require("./second-crop-linkings/second-crop-linkings.route"),
  ...require("./pk-balance/pk-balance.route"),
  ...require("./farm-manure-type/farm-manure-type.route"),
  ...require("./country/country.route"),
  ...require("./grassManagementOptions/grassManagementOptions.route"),
  ...require("./inprogress-calculations/Inprogress-calculations.route"),
  ...require("./soil-type-soil-texture/soil-type-soil-texture.route"),
  ...require("./excess-winter-rainfall-options/excess-winter-rainfall-options.route"),
];
