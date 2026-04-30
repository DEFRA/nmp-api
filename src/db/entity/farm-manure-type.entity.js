const { EntitySchema } = require("typeorm");
const { manureNutrientColumns } = require("../../constants/manure-nutrient.columns");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const FarmManureTypeEntity = new EntitySchema({
  name: "FarmManureType",
  tableName: "FarmManureTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generatedIdentity: "ALWAYS",
    },
    FarmID: {
      type: "int",
    },
    ManureTypeID: {
      type: "int",
    },
    ManureTypeName: {
      type: "nvarchar",
      length: 250,
    },
    FieldTypeID: {
      type: "int",
    },
    ...manureNutrientColumns,
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
    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedOrganicManures",
    },
    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedOrganicManures",
    },
    Farm: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "FarmManureTypes",
    },
    ManureType: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "ManureType",
      joinColumn: { name: "ManureTypeID" },
      inverseSide: "FarmManureTypes",
    },
  },
});

module.exports = { FarmManureTypeEntity };
