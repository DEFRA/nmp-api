const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const NutrientProductsEntity = new EntitySchema({
  name: "NutrientProduct",
  tableName: "NutrientProducts",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "increment",
    },
    Name: {
      type: "nvarchar",
      length: 255,
      nullable: false,
    },
    NutrientID: {
      type: "int",
      nullable: false,
    },
    NutrientPercentage: {
      type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
    },
    IsNutrientDefaultProduct: {
      type: "bit",
      nullable: true,
    },
    MeasurementUnit: {
      type: "nvarchar",
      length: 20,
      nullable: true,
    },
  },
});

module.exports = { NutrientProductsEntity };
