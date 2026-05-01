const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const ManagementPeriodEntity = new EntitySchema({
  name: "ManagementPeriod",
  tableName: "ManagementPeriods",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "increment",
    },
    CropID: {
      type: "int",
    },
    Defoliation: {
      type: "int",
      default: 1,
      nullable: true,
    },
    Utilisation1ID: {
      type: "int",
      default: 0,
      nullable: true,
    },
    Utilisation2ID: {
      type: "int",
      default: 0,
      nullable: true,
    },
    Yield: {
      type: "decimal",
      precision: 18,
      scale: 3,
      default: 0,
      nullable: true,
    },
    PloughedDown: {
      type: "datetime2",
      precision: 7,
      nullable: true,
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      default: () => "GETDATE()",
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
    },
    PreviousID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Crops: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Crop",
      joinColumn: { name: "CropID" },
      inverseSide: "ManagementPeriods",
    },
    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedManagementPeriods",
    },
    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedManagementPeriods",
    },
    Recommendations: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Recommendation",
      joinColumn: { name: "ID" },
      inverseSide: "ManagementPeriod",
    },
    OrganicManures: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "OrganicManure",
      joinColumn: { name: "ID" },
      inverseSide: "ManagementPeriod",
    },
    FertiliserManures: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "FertiliserManures",
      joinColumn: { name: "ID" },
      inverseSide: "ManagementPeriod",
    },
  },
});

module.exports = { ManagementPeriodEntity };
