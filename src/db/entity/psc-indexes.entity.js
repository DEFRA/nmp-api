const { EntitySchema } = require("typeorm");

const PscIndexEntity = new EntitySchema({
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

module.exports = { PscIndexEntity };
