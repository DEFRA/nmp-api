const { EntitySchema } = require("typeorm");

const MoistureTypeEntity = new EntitySchema({
  name: "MoistureType",
  tableName: "MoistureTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "increment",
    },
    Name: {
      type: "nvarchar",
      length: 100,
      nullable: false,
    },
  },
  relations: {
    OrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "MoistureType",
    },
  },
});

module.exports = { MoistureTypeEntity };
