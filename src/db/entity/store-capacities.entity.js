const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

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
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "StoreCapacity",
    },
    MaterialState: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "MaterialStates",
      joinColumn: { name: "MaterialStateID" },
      inverseSide: "StoreCapacity",
    },
    StorageType: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "StorageTypes",
      joinColumn: { name: "StorageTypeID" },
      inverseSide: "StoreCapacity",
    },
    SolidManureType: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "SolidManureTypes",
      joinColumn: { name: "SolidManureTypeID" },
      inverseSide: "StoreCapacity",
    },
    BankSlopeAngle: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "BankSlopeAngles",
      joinColumn: { name: "BankSlopeAngleID" },
      inverseSide: "StoreCapacity",
    },

    CreatedBy: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedStoreCapacitiesByUser",
    },
    ModifiedBy: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedStoreCapacitiesByUser",
    },
  },
});

module.exports = { StoreCapacitiesEntity };
