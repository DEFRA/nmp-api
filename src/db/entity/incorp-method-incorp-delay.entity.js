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
    }
  }
});

module.exports = { IncorpMethodsIncorpDelayEntity };
