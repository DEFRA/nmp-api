const { EntitySchema } = require("typeorm");

const GrassTypicalCutsEntity = new EntitySchema({
  name: "GrassTypicalCuts",
  tableName: "GrassTypicalCuts",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "Id",
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
      name: "Name",
    },
  },
  relations: {
    PreviousGrasses: {
      type: "one-to-many",
      target: "PreviousGrasses",
      joinColumn: { name: "ID" },
      inverseSide: "GrassTypicalCuts",
    },
  },
});

module.exports = { GrassTypicalCutsEntity };
