const { EntitySchema } = require("typeorm");

const IncorpMethodsIncorpDelayEntity = new EntitySchema({
  name: "IncorpMethodsIncorpDelay",
  tableName: "IncorpMethodsIncorpDelays",
  columns: {
    IncorporationMethodID: {
      type: "int",
      primary: true,
    },
    IncorporationDelayID: {
      type: "int",
      primary: true,
    },
  },
  relations: {
    IncorporationMethod: {
      type: "many-to-one",
      target: "IncorporationMethod",
      joinColumn: { name: "IncorporationMethodID" },
      inverseSide: "IncorpMethodsIncorpDelays",
    }
  },
});

module.exports = { IncorpMethodsIncorpDelayEntity };
