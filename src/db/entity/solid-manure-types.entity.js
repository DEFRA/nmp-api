const { EntitySchema } = require("typeorm");

const SolidManureTypesEntity = new EntitySchema({
  name: "SolidManureTypes",
  tableName: "SolidManureTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true, 
      name: "ID",
    },
    Name: {
      type: "nvarchar",
      length: 50,
      nullable: false,
      name: "Name",
    },
    Density: {
      type: "decimal",
      precision: 18,
      scale: 1,
      nullable: false,
      name: "Density",
    },
  },
});

module.exports = { SolidManureTypesEntity };
