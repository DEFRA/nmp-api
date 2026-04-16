const { EntitySchema } = require("typeorm");
const { auditColumns } = require("../../constants/audits-columns");

const FarmAverageYieldsEntity = new EntitySchema({
  name: "FarmAverageYields",
  tableName: "FarmAverageYields",
  columns: {
    FarmID: {
      type: "int",
      primary: true,
    },
    HarvestYear: {
      type: "int",
      primary: true,
    },
    CropTypeID: {
      type: "int",
      primary: true,
    },
    AverageYield: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    ...auditColumns,
  },
  relations: {
    Farm: {
      type: "many-to-one",
      target: "Farms",
      joinColumn: { name: "FarmID" },
      inverseSide: "FarmAverageYields",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedFarmAverageYields",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedFarmAverageYields",
    },
  },
});

module.exports = { FarmAverageYieldsEntity };
