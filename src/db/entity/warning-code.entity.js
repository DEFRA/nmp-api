const { EntitySchema } = require("typeorm");

const WarningCodeEntity = new EntitySchema({
  name: "WarningCode",
  tableName: "WarningCodes",
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
  },
  relations: {
  WarningMessages: {
    type: "one-to-many",
    target: "WarningMessages",
    inverseSide: "WarningCode", // matches the property name in WarningMessagesEntity
  },
},

});

module.exports = { WarningCodeEntity };
