const { EntitySchema } = require("typeorm");
// const { OrganicManureEntity } = require("./organic-manure.entity");

const WindspeedEntity = new EntitySchema({
  name: "Windspeed",
  tableName: "Windspeeds",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
    },
    Name: {
      type: "nvarchar",
      length: 100,
      nullable: false,
    },
    FromScale: {
      type: "int",
      nullable: false,
    },
    ToScale: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    OrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "Windspeed",
    },
  },
});

module.exports = { WindspeedEntity };
