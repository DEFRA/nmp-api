const { EntitySchema } = require("typeorm");

const InOrganicManureDurationEntity = new EntitySchema({
  name: "InOrganicManureDuration",
  tableName: "InOrganicManureDurations",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generatedIdentity: "ALWAYS",
    },
    Name: {
      type: "nvarchar",
      length: 100,
    },
    ApplicationDate: {
      type: "int",
    },
    ApplicationMonth: {
      type: "int",
    },
  },
});

module.exports = { InOrganicManureDurationEntity };
