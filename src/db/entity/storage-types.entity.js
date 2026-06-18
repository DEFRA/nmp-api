const { EntitySchema } = require("typeorm");

const StorageTypesEntity = new EntitySchema({
  name: "StorageTypes",
  tableName: "StorageTypes",
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
    FreeBoardHeight: {
      type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
      name: "FreeBoardHeight",
    },
  },
  relations: {
    StorageCapacity: {
      type: "one-to-many",
      target: "StoreCapacities",
      joinColumn: { name: "ID" },
      inverseSide: "StorageType",
    },
  },
});

module.exports = { StorageTypesEntity };
