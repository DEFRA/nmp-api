const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const CountryEntity = new EntitySchema({
  name: "Country",
  tableName: "Countries",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity"
    },
    Name: {
      type: "nvarchar",
      length: 50
    },
    RB209CountryID: {
      type: "int",
      nullable: false
    },
  },
  relations: {
    ManureTypes: {
      target: "ManureType",
      type: RELATION_TYPES.MANY_TO_ONE,
      inverseSide: "Country",
      joinColumn: { name: "ID" }
    },
    Farms: {
      target: "Farm",
      type: RELATION_TYPES.ONE_TO_MANY,
      inverseSide: "Country",
      joinColumn: { name: "ID" }
    },
    MannerEstimations: {
      target: "MannerEstimations",
      type: RELATION_TYPES.ONE_TO_MANY,
      inverseSide: "Country",
      joinColumn: { name: "ID" }
    },
  },
});

module.exports = { CountryEntity };
