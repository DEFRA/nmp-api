const { EntitySchema } = require("typeorm");

const GrassManagementOptionsEntity = new EntitySchema({
  name: "GrassManagementOptions",
  tableName: "GrassManagementOptions",
  columns: {
    ID: {
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
  relations: {
    PreviousGrasses: {
      type: "one-to-many",
      target: "PreviousGrasses",
      joinColumn: { name: "ID" },
      inverseSide: "GrassManagementOptions",
    },
    PreviousCroppingGrassManagementOption: {
      type: "one-to-many",
      target: "PreviousCroppings",
      joinColumn: { name: "ID" },
      inverseSide: "GrassManagementOptions",
    },
  },
});

module.exports = { GrassManagementOptionsEntity };
