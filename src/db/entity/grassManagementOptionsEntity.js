const { EntitySchema } = require("typeorm");

const GrassManagementOptionsEntity = new EntitySchema({
  name: "GrassManagementOptions",
  tableName: "GrassManagementOptions",
  columns: {
    Id: {
      type: "int",
      primary: true,
      generated: true,
      name: "Id",
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
      name: "Name",
    },
  },
});

module.exports = { GrassManagementOptionsEntity };
