const { EntitySchema } = require("typeorm");

const MaterialStatesEntity = new EntitySchema({
  name: "MaterialStates",
  tableName: "MaterialStates",
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
  },
});

module.exports = { MaterialStatesEntity };
