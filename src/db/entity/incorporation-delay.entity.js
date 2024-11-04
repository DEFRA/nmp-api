const { EntitySchema } = require("typeorm");

const IncorporationDelayEntity = new EntitySchema({
  name: "IncorporationDelay",
  tableName: "IncorporationDelays",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    Name: {
      type: "nvarchar",
      length: 100,
      nullable: false,
    },
    Hours: {
      type: "int",
      nullable: true,
    },
    CumulativeHours: {
      type: "int",
      nullable: true,
    },
    ApplicableFor: {
      type: "nvarchar",
      length: 1,
      nullable: true,
    },
  },
  relations: {
    IncorpMethodsIncorpDelays: {
      type: "one-to-many",
      target: "IncorpMethodsIncorpDelay",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationDelay",
    },
    OrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationDelay",
    },
  },
});

module.exports = { IncorporationDelayEntity };
