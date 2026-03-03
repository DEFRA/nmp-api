const { EntitySchema } = require("typeorm");

const PscIndexesEntity = new EntitySchema({
  name: "PscIndexes",
  tableName: "PscIndexes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true, 
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
    },
  },
});

module.exports = { PscIndexesEntity };
