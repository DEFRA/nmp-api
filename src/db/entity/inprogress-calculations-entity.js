const { EntitySchema } = require("typeorm");

const InprogressCalculationsEntity = new EntitySchema({
  name: "InprogressCalculations",
  tableName: "InprogressCalculations",
  columns: {
    FarmID: {
      type: "int",
      primary: true,
      nullable: false,
    },
  },
  relations: {
    Farm: {
      type: "many-to-one",
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "InprogressCalculations",
    },
  },
});

module.exports = { InprogressCalculationsEntity };
