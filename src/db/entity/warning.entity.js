const { EntitySchema } = require("typeorm");

const WarningsEntity = new EntitySchema({
  name: "Warnings",
  tableName: "Warnings",

  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },

    WarningKey: {
      type: "nvarchar",
      length: 200,
      nullable: false,
      name: "WarningKey",
    },

    CountryID: {
      type: "int",
      nullable: false,
      name: "CountryID",
    },

    Header: {
      type: "nvarchar",
      length: "MAX",
      nullable: true,
      name: "Header",
    },

    Para1: {
      type: "nvarchar",
      length: "MAX",
      nullable: true,
      name: "Para1",
    },

    Para2: {
      type: "nvarchar",
      length: "MAX",
      nullable: true,
      name: "Para2",
    },

    Para3: {
      type: "nvarchar",
      length: "MAX",
      nullable: true,
      name: "Para3",
    },
  },

 
});

module.exports = { WarningsEntity };
