const { EntitySchema } = require("typeorm");

const ManureTypeCategoryEntity = new EntitySchema({
  name: "ManureTypeCategory",
  tableName: "ManureTypeCategories",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
    },
    Name: {
      type: "nvarchar",
      length: 250,
    },
  },
  relations: {
    ManureTypes: {
      target: "ManureType",
      type: "one-to-many",
      inverseSide: "ManureTypeCategory",
      joinColumn: { name: "ID" },
    },
  },
});

module.exports = { ManureTypeCategoryEntity };
