const { EntitySchema } = require("typeorm");

const StoreCapacitiesEntity = new EntitySchema({
  name: "StoreCapacities",
  tableName: "StoreCapacities",
  columns: {
    FarmID: {
      type: "int",
      primary: true,
      name: "FarmID",
    },
    Year: {
      type: "int",
      primary: true,
      name: "Year",
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
  },
//   relations: {
//     Farm: {
//       type: "many-to-one",
//       target: "Farms",
//       joinColumn: { name: "FarmID" },
//     },
//     MaterialState: {
//       type: "many-to-one",
//       target: "MaterialStates",
//       joinColumn: { name: "MaterialStateID" },
//     },
//     StorageType: {
//       type: "many-to-one",
//       target: "StorageTypes",
//       joinColumn: { name: "StorageTypeID" },
//     },
//     SolidManureType: {
//       type: "many-to-one",
//       target: "SolidManureTypes",
//       joinColumn: { name: "SolidManureTypeID" },
//     },
//     BankSlopeAngle: {
//       type: "many-to-one",
//       target: "BankSlopeAngles",
//       joinColumn: { name: "BankSlopeAngleID" },
//     },
//   },
});

module.exports = { StoreCapacitiesEntity };
