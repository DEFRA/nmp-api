const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

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
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "ApplicationMethodsIncorpMethod",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationMethod",
    },
    IncorpMethodsIncorpDelays: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "IncorpMethodsIncorpDelay",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationMethod",
    },
    OrganicManures: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "IncorporationMethod",
    },
  },
});

module.exports = { IncorporationMethodEntity };
