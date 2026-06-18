const { EntitySchema } = require("typeorm");

const StoreCapacitiesEntity = new EntitySchema({
  name: "StoreCapacities",
  tableName: "StoreCapacities",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    FarmID: {
      type: "int",
      nullable: false,
      name: "FarmID",
    },
    StoreName: {
      type: "nvarchar",
      length: 128,
      nullable: false,
      name: "StoreName",
    },
    MaterialStateID: {
      type: "int",
      nullable: false,
      name: "MaterialStateID",
    },
    StorageTypeID: {
      type: "int",
      nullable: true,
      name: "StorageTypeID",
    },
    SolidManureTypeID: {
      type: "int",
      nullable: true,
      name: "SolidManureTypeID",
    },
    Length: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "Length",
    },
    Width: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "Width",
    },
    Depth: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "Depth",
    },
    Circumference: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "Circumference",
    },
    Diameter: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "Diameter",
    },
    BankSlopeAngleID: {
      type: "int",
      nullable: true,
      name: "BankSlopeAngleID",
    },
    IsCovered: {
      type: "bit",
      nullable: true,
      name: "IsCovered",
    },
    CapacityVolume: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "CapacityVolume",
    },
    CapacityWeight: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "CapacityWeight",
    },
    SurfaceArea: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "SurfaceArea",
    },
    PreviousID: {
      type: "int",
      nullable: true,
      name: "PreviousID",
    },
    CreatedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
      default: "GETDATE()",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
      default: "GETDATE()",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Farms: {
      type: "many-to-one",
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "StoreCapacity",
    },
    MaterialState: {
      type: "many-to-one",
      target: "MaterialStates",
      joinColumn: { name: "MaterialStateID" },
      inverseSide: "StoreCapacity",
    },
    StorageType: {
      type: "many-to-one",
      target: "StorageTypes",
      joinColumn: { name: "StorageTypeID" },
      inverseSide: "StoreCapacity",
    },
    SolidManureType: {
      type: "many-to-one",
      target: "SolidManureTypes",
      joinColumn: { name: "SolidManureTypeID" },
      inverseSide: "StoreCapacity",
    },
    BankSlopeAngle: {
      type: "many-to-one",
      target: "BankSlopeAngles",
      joinColumn: { name: "BankSlopeAngleID" },
      inverseSide: "StoreCapacity",
    },

    CreatedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedStoreCapacitiesByUser",
    },
    ModifiedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedStoreCapacitiesByUser",
    },
  },
});

module.exports = { StoreCapacitiesEntity };
