const { EntitySchema } = require("typeorm");

const SNSCategoriesEntity = new EntitySchema({
  name: "SNSCategories",
  tableName: "SNSCategories",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true, // Auto-increment behavior for the ID field
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
    },
  },
  relations: {
    CropTypeLinkings: {
      type: "one-to-many",
      target: "CropTypeLinking",
      joinColumn: { name: "ID" },
      inverseSide: "SNSCategories",
    },
  },
});

module.exports = { SNSCategoriesEntity };
