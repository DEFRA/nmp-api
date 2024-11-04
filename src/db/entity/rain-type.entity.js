const { EntitySchema } = require("typeorm");

const RainTypeEntity = new EntitySchema({
  name: "RainType",
  tableName: "RainTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    Name: {
      type: "nvarchar",
      length: 100,
    },
    RainInMM: {
      type: "int",
    },
  },
  relations: {
    OrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "RainType",
    },
  },
});
module.exports = { RainTypeEntity };
