const { EntitySchema } = require("typeorm");
const { manureNutrientColumns } = require("../../constants/manure-nutrient.columns");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

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
    ...manureNutrientColumns,
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
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "ManureType",
    },
    ManureGroup: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "ManureGroup",
      joinColumn: { name: "ManureGroupID" },
      inverseSide: "ManureTypes",
    },
    Country: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Country",
      joinColumn: { name: "CountryID" },
      inverseSide: "ManureTypes",
    },
    ManureTypeCategory: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "ManureTypeCategory",
      joinColumn: { name: "ManureTypeCategoryID" },
      inverseSide: "ManureTypes",
    },
    FarmManureTypes: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FarmManureType",
      joinColumn: { name: "ID" },
      inverseSide: "ManureType",
    },
  },
});

module.exports = { ManureTypeEntity };
