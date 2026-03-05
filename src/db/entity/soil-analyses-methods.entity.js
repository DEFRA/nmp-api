const { EntitySchema } = require("typeorm");

const SoilAnalysesMethodsEntity = new EntitySchema({
  name: "SoilAnalysesMethod",
  tableName: "SoilAnalysesMethods",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false
    },
  },
});

module.exports = { SoilAnalysesMethodsEntity };
