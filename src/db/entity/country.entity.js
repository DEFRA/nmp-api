const { EntitySchema } = require("typeorm");

const CountryEntity = new EntitySchema({
  name: "Country",
  tableName: "Countries",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
    },
    Name: {
      type: "nvarchar",
      length: 50,
    },
    RB209CountryID: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    ManureTypes: {
      target: "ManureType",
      type: "one-to-many",
      inverseSide: "Country",
      joinColumn: { name: "ID" },
    },
    Farms: {
      target: "Farm",
      type: "one-to-many",
      inverseSide: "Country",
      joinColumn: { name: "CountryID" }, // Specifies the column in the Farm table that links to Country
    },
  },
});

module.exports = { CountryEntity };
