const { EntitySchema } = require("typeorm");

const CropInfoQuestionsEntity = new EntitySchema({
  name: "CropInfoQuestions", // Entity name
  tableName: "CropInfoQuestions", // Table name in the database
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    CropInfoQuestion: {
      type: "nvarchar",
      length: 250,
      nullable: true,
    },
  },
  relations: {
    CropTypeLinking: {
      type: "one-to-many",
      target: "CropTypeLinking",
      joinColumn: { name: "ID" },
      inverseSide: "CropInfoOneQuestion",
    },
  },
});

module.exports = { CropInfoQuestionsEntity };
