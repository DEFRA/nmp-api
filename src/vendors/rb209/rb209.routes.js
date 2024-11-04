module.exports = [
  ...require("./soil/soil.route"),
  ...require("./arable/arable.route"),
  ...require("./recommendation/recommendation.route"),
  ...require("./organic-material/organic-material.route"),
  ...require("./field/field.route"),
  ...require("./grassland/grassland.route"),
  ...require("./measurement/measurement.route"),
  ...require("./adviceNote/adviceNote.route"),
  ...require("./previousCropping/previousCropping.route"),
  ...require("./rainfall/rainfall.route")
];
