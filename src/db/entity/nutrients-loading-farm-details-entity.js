const { EntitySchema } = require("typeorm");

const NutrientsLoadingFarmDetailsEntity = new EntitySchema({
  name: "NutrientsLoadingFarmDetails",
  tableName: "NutrientsLoadingFarmDetails",
  columns: {
    Id: {
      type: "int",
      primary: true,
      generated: true,
      name: "Id",
    },
    FarmId: {
      type: "int",
      nullable: false,
      name: "FarmId",
    },
    CalendarYear: {
      type: "int",
      nullable: false,
      name: "CalendarYear",
    },
    LandInNVZ: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "LandInNVZ",
    },
    LandNotNVZ: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "LandNotNVZ",
    },
    TotalFarmed: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "TotalFarmed",
    },
    ManureTotal: {
      type: "int",
      nullable: true,
      name: "ManureTotal",
    },
    Derogation: {
      type: "bit",
      nullable: false,
      name: "Derogation",
    },
    GrassPercentage: {
      type: "int",
      nullable: true,
      name: "GrassPercentage",
    },
    ContingencyPlan: {
      type: "bit",
      nullable: false,
      name: "ContingencyPlan",
    },
  },
});

module.exports = { NutrientsLoadingFarmDetailsEntity };
