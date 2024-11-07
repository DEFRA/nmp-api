const { EntitySchema } = require("typeorm");

const IncorporationMethodEntity = new EntitySchema({
  name: "IncorporationMethod",
  tableName: "IncorporationMethods",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "increment",
    },
    Name: {
      type: "nvarchar",
      length: 100,
      nullable: false,
    },
    ApplicableForGrass: {
      type: "nvarchar",
      length: 1,
      nullable: true,
    },
    ApplicableForArableAndHorticulture: {
      type: "nvarchar",
      length: 1,
      nullable: true,
    },
  },
  relations: {
    ApplicationMethodsIncorpMethods: {
      type: "one-to-many",
      target: "ApplicationMethodsIncorpMethod",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationMethod",
    },
    IncorpMethodsIncorpDelays: {
      type: "one-to-many",
      target: "IncorpMethodsIncorpDelay",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationMethod",
    },
    OrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationMethod",
    },
  },
});

module.exports = { IncorporationMethodEntity };
