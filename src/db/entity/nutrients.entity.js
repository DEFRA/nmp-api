const { EntitySchema } = require("typeorm");

const NutrientsEntity = new EntitySchema({
  name: "Nutrient",
  tableName: "Nutrients",
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
    Symbol: {
      type: "nvarchar",
      length: 4,
      nullable: false,
    },
    MeasurementUnit: {
     type: "nvarchar",
      length: 20,
      nullable: false,
    },
    UnitRate: {
      type: "decimal",
       precision: 18,
      scale: 2,
      nullable: true,
    },
    CurrencyCode: {
      type: "nvarchar",
      length: 3,
      nullable: true,
    },
  },
});

module.exports = { NutrientsEntity };
