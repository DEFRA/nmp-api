const { EntitySchema } = require("typeorm");

const ApplicationMethodsIncorpMethodEntity = new EntitySchema({
  name: "ApplicationMethodsIncorpMethod",
  tableName: "ApplicationMethodsIncorpMethods",
  columns: {
    ApplicationMethodID: {
      type: "int",
      primary: true,
    },
    IncorporationMethodID: {
      type: "int",
      primary: true,
    }
  }
});

module.exports = { ApplicationMethodsIncorpMethodEntity };
