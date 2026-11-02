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
    },
  },
  relations: {
    IncorporationMethod: {
      type: "many-to-one",
      target: "IncorporationMethod",
      joinColumn: { name: "IncorporationMethodID" },
      inverseSide: "ApplicationMethodsIncorpMethods",
    },
  },
});

module.exports = { ApplicationMethodsIncorpMethodEntity };
