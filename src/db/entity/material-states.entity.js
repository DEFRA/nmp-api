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
  relations: {
    StoreCapacity: {
      type: "one-to-many",
      target: "StoreCapacities",
      joinColumn: { name: "ID" },
      inverseSide: "MaterialState",
    },
  },
});

module.exports = { MaterialStatesEntity };
