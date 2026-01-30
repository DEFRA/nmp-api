const JOINS = {
  ORGANIC_MANURE_TO_MANAGEMENT_PERIOD: "O.ManagementPeriodID = M.ID",

  MANAGEMENT_PERIOD_TO_CROP: "M.CropID = C.ID",
};

module.exports = { JOINS };

