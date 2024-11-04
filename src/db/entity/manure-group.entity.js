const { EntitySchema } = require("typeorm");

const ManureGroupEntity = new EntitySchema({
  name: "ManureGroup",
  tableName: "ManureGroups",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
    },
  },
  relations: {
    ManureTypes: {
      type: "one-to-many",
      target: "ManureType",
      joinColumn: { name: "ID" },
      inverseSide: "ManureGroup",
    },
  },
});

module.exports = { ManureGroupEntity };
