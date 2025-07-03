const { EntitySchema } = require("typeorm");

const NutrientsLoadingFarmDetailsEntity = new EntitySchema({
  name: "NutrientsLoadingFarmDetails",
  tableName: "NutrientsLoadingFarmDetails",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    FarmID: {
      type: "int",
      nullable: false,
      name: "FarmID",
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
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      name: "CreatedOn",
      default: () => "getdate()",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
      name: "CreatedByID",
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      name: "ModifiedOn",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
      name: "ModifiedByID",
    },
  },
  relations: {
    Farm: {
      type: "one-to-one",
      target: "Farms",
      joinColumn: {
        name: "FarmID",
      },
    },
  }
});

module.exports = { NutrientsLoadingFarmDetailsEntity };
