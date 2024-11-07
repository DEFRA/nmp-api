const { EntitySchema } = require("typeorm");

const ManureTypeEntity = new EntitySchema({
  name: "ManureType",
  tableName: "ManureTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    Name: {
      type: "nvarchar",
      length: 100,
    },
    ManureGroupID: {
      type: "int",
    },
    CountryID: {
      type: "int",
    },
    ManureTypeCategoryID: {
      type: "int",
      nullable: true,
    },
    HighReadilyAvailableNitrogen: {
      type: "bit",
    },
    IsLiquid: {
      type: "bit",
    },
    DryMatter: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    TotalN: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    NH4N: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    Uric: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    NO3N: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    P2O5: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    K2O: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    SO3: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    MgO: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    P2O5Available: {
      type: "int",
    },
    K2OAvailable: {
      type: "int",
    },
    NMaxConstant: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    ApplicationRateArable: {
      type: "int",
    },
    ApplicationRateGrass: {
      type: "int",
    },
  },
  relations: {
    OrganicManures: {
      type: "one-to-many",
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "ManureType",
    },
    ManureGroup: {
      type: "many-to-one",
      target: "ManureGroup",
      joinColumn: { name: "ManureGroupID" },
      inverseSide: "ManureTypes",
    },
    Country: {
      type: "many-to-one",
      target: "Country",
      joinColumn: { name: "CountryID" },
      inverseSide: "ManureTypes",
    },
    ManureTypeCategory: {
      type: "many-to-one",
      target: "ManureTypeCategory",
      joinColumn: { name: "ManureTypeCategoryID" },
      inverseSide: "ManureTypes",
    },
    FarmManureTypes: {
      type: "one-to-many",
      target: "FarmManureType",
      joinColumn: { name: "ID" },
      inverseSide: "ManureType",
    },
  },
});

module.exports = { ManureTypeEntity };
