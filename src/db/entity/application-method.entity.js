const { EntitySchema } = require("typeorm");

const ApplicationMethodEntity = new EntitySchema({
  name: "ApplicationMethod",
  tableName: "ApplicationMethods",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: "identity",
      generatedIdentity: "ALWAYS",
    },
    Name: {
      type: "nvarchar",
      length: 100,
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
      inverseSide: "ApplicationMethod",
    },
    OrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "ApplicationMethod",
    },
  },
});

module.exports = { ApplicationMethodEntity };
