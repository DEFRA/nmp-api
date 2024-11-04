const { EntitySchema } = require("typeorm");

const OrganisationEntity = new EntitySchema({
  name: "Organisation",
  tableName: "Organisations",
  columns: {
    ID: {
      type: "uuid",
      primary: true,
      generated: "uuid",
    },
    Name: {
      type: "nvarchar",
      length: 512,
    },
  },
  relations: {
    Farms: {
      type: "one-to-many",
      target: "Farm",
      joinColumn: { name: "ID" },
      inverseSide: "Organisation",
    },
  },
});

module.exports = { OrganisationEntity };
