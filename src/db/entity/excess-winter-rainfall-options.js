const { EntitySchema } = require("typeorm");

const ExcessWinterRainfallOptionsEntity = new EntitySchema({
  name: "ExcessWinterRainfallOptions",
  tableName: "ExcessWinterRainfallOptions",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
      name: "Name",
    },
    Value: {
      type: "int",
      nullable: false,
      name: "Value",
    },
  },
});

module.exports = { ExcessWinterRainfallOptionsEntity };
