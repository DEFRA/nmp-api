const { EntitySchema } = require("typeorm");
 
const CropEntity = new EntitySchema({
  name: "Crop",
  tableName: "Crops",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generatedIdentity: "ALWAYS",
    },
    FieldID: {
      type: "int",
    },
    Year: {
      type: "int",
    },
    CropTypeID: {
      type: "int",
      nullable: true,
    },
    FieldType: {
      type: "int",
      default: 1,
    },
    Variety: {
      type: "nvarchar",
      length: 100,
      nullable: true,
    },
    OtherCropName: {
      type: "nvarchar",
      length: 128,
      nullable: true,
    },
    CropInfo1: {
      type: "int",
      nullable: true,
    },
    CropInfo2: {
      type: "int",
      nullable: true,
    },
    SowingDate: {
      type: "datetime2",
      nullable: true,
      precision: 7,
    },
    Yield: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    Confirm: {
      type: "bit",
      default: 0,
    },
    PreviousGrass: {
      type: "int",
      nullable: true,
    },
    GrassHistory: {
      type: "int",
      nullable: true,
    },
    Comments: {
      type: "nvarchar",
      nullable: true,
    },
    Establishment: {
      type: "int",
      nullable: true,
    },
    LivestockType: {
      type: "int",
      nullable: true,
    },
    MilkYield: {
      type: "decimal",
      precision: 18,
      scale: 3,
      default: 0,
      nullable: true,
    },
    ConcentrateUse: {
      type: "decimal",
      precision: 18,
      scale: 3,
      default: 0,
      nullable: true,
    },
    StockingRate: {
      type: "decimal",
      precision: 18,
      scale: 3,
      default: 0,
      nullable: true,
    },
    DefoliationSequence: {
      type: "int",
      default: 0,
      nullable: true,
    },
    GrazingIntensity: {
      type: "int",
      nullable: true,
    },
    PreviousID: {
      type: "int",
      nullable: true,
    },
    CropOrder: {
      type: "int",
      default: 1,
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      default: () => "CURRENT_TIMESTAMP",
      nullable: true,
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Field: {
      type: "many-to-one",
      target: "Field",
      joinColumn: { name: "FieldID" },
      inverseSide: "Crops",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedCrops",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedCrops",
    },
    ManagementPeriods: {
      type: "one-to-many",
      target: "ManagementPeriod",
      joinColumn: { name: "CropID" },
      inverseSide: "Crop",
    },
  },
});
 
module.exports = { CropEntity };