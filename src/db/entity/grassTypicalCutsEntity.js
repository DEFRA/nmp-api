const { EntitySchema } = require("typeorm");

const GrassTypicalCutsEntity = new EntitySchema({
  name: "GrassTypicalCuts",
  tableName: "GrassTypicalCuts",
  columns: {
    Id: {
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
});

module.exports = { GrassTypicalCutsEntity };
