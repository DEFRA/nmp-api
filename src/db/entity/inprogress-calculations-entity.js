const { EntitySchema } = require("typeorm");

const InprogressCalculationsEntity = new EntitySchema({
  name: "InprogressCalculations",
  tableName: "InprogressCalculations",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true, 
    },
    FarmID: {
      type: "int",
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
