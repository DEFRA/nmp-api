const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const FarmEntity = new EntitySchema({
  name: "Farm",
  tableName: "Farms",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    OrganisationID: {
      type: "uniqueidentifier",
    },
    Name: {
      type: "nvarchar",
      length: 250,
    },
    Address1: {
      type: "nvarchar",
      length: 250,
      nullable: true,
    },
    Address2: {
      type: "nvarchar",
      length: 250,
      nullable: true,
    },
    Address3: {
      type: "nvarchar",
      length: 250,
      nullable: true,
    },
    Address4: {
      type: "nvarchar",
      length: 250,
      nullable: true,
    },
    Postcode: {
      type: "nvarchar",
      length: 50,
    },
    CPH: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    FarmerName: {
      type: "nvarchar",
      length: 128,
      nullable: true,
    },
    BusinessName: {
      type: "nvarchar",
      length: 128,
      nullable: true,
    },
    SBI: {
      type: "nvarchar",
      length: 20,
      nullable: true,
    },
    Telephone: {
      type: "nvarchar",
      length: 15,
      nullable: true,
    },
    Mobile: {
      type: "nvarchar",
      length: 13,
      nullable: true,
    },
    Email: {
      type: "nvarchar",
      length: 256,
      nullable: true,
    },
    Rainfall: {
      type: "int",
      nullable: true,
    },
    TotalFarmArea: {
      type: "decimal",
      precision: 18,
      scale: 4,
      default: 0,
    },
    AverageAltitude: {
      type: "int",
      default: 0,
    },
    RegisteredOrganicProducer: {
      type: "bit",
      default: 0,
    },
    MetricUnits: {
      type: "bit",
      default: 0,
    },
    EnglishRules: {
      type: "bit",
      default: 1,
    },
    NVZFields: {
      type: "int",
      default: 0,
    },
    FieldsAbove300SeaLevel: {
      type: "int",
      default: 0,
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
    STD: {
      type: "nvarchar",
      length: 6,
      nullable: true,
    },
    CountryID: {
      type: "int",
      default: 1,
    },
    ClimateDataPostCode: {
      type: "nvarchar",
      length: 50,
    },
  },
  relations: {
    Fields: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Field",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    Organisation: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Organisation",
      joinColumn: { name: "OrganisationID" },
      inverseSide: "Farms",
    },
    FarmManureTypes: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmManureType",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    ExcessRainfalls: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "ExcessRainfalls",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    NutrientsLoadingLiveStocks: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "NutrientsLoadingLiveStocks",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    CreatedByUser: {
      target: "User",
      type: RELATION_TYPES.MANY_TO_ONE,
      inverseSide: "CreatedFarms",
      joinColumn: { name: "CreatedByID" },
    },
    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      inverseSide: "ModifiedFarms",
      joinColumn: { name: "ModifiedByID" },
    },
    Country: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Country",
      joinColumn: { name: "CountryID" },
      inverseSide: "Farms",
    },
    StoreCapacity: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "StoreCapacities",
      joinColumn: { name: "ID" },
      inverseSide: "Farms",
    },
    FarmsNVZ: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmsNVZ",
      joinColumn: { name: "ID" },
      inverseSide: "Farms",
    },
    FarmAverageYields: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmAverageYields",
      joinColumn: { name: "ID" },
      inverseSide: "Farms",
    },
  },
});

module.exports = { FarmEntity };
