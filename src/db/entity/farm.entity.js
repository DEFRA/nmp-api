const { EntitySchema } = require("typeorm");

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
      length: 50,
      nullable: true,
    },
    Address2: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    Address3: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    Address4: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    Postcode: {
      type: "nvarchar",
      length: 8,
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
      length: 255,
      nullable: true,
    },
    LastHarvestYear: {
      type: "int",
      nullable: true,
    },
    CountryID: {
      type: "int",
      default: 1,
    },
    ClimateDataPostCode: {
      type: "nvarchar",
      length: 8,
    },
  },
  relations: {
    Fields: {
      type: "one-to-many",
      target: "Field",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    Organisation: {
      type: "many-to-one",
      target: "Organisation",
      joinColumn: { name: "OrganisationID" },
      inverseSide: "Farms",
    },
    FarmManureTypes: {
      type: "one-to-many",
      target: "FarmManureType",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    FarmManureTypes: {
      type: "one-to-many",
      target: "FarmManureType",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    ExcessRainfalls: {
      type: "one-to-many",
      target: "ExcessRainfalls",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    NutrientsLoadingLiveStocks: {
      type: "one-to-many",
      target: "NutrientsLoadingLiveStocks",
      joinColumn: { name: "ID" },
      inverseSide: "Farm",
    },
    CreatedByUser: {
      target: "User",
      type: "many-to-one",
      inverseSide: "CreatedFarms",
      joinColumn: { name: "CreatedByID" },
    },
    ModifiedByUser: {
      target: "User",
      type: "many-to-one",
      inverseSide: "ModifiedFarms",
      joinColumn: { name: "ModifiedByID" },
    },
    Country: {
      type: "many-to-one",
      target: "Country",
      joinColumn: { name: "CountryID" },
      inverseSide: "Farms",
    },
    // InprogressCalculations: {
    //   type: "one-to-many",
    //   target: "InprogressCalculations",
    //   joinColumn: { name: "ID" },
    //   inverseSide: "Farm",
    // },
  },
});

module.exports = { FarmEntity };
