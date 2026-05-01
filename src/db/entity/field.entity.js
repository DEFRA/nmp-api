const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const FieldEntity = new EntitySchema({
  name: "Field",
  tableName: "Fields",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    FarmID: {
      type: "int",
    },
    SoilTypeID: {
      type: "int",
      nullable: true,
    },
    NVZProgrammeID: {
      type: "int",
      default: 1,
      nullable: true,
    },
    PscIndexID: {
      type: "int",
      default: 1,
      nullable: true,
    },
    Name: {
      type: "nvarchar",
      length: 50,
    },
    LPIDNumber: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    NationalGridReference: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    OtherReference: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    TotalArea: {
      type: "decimal",
      precision: 18,
      scale: 3,
    },
    CroppedArea: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureNonSpreadingArea: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    SoilReleasingClay: {
      type: "bit",
      nullable: true,
      default: 0,
    },
    SoilOverChalk: {
      type: "bit",
      nullable: true,
      default: 0,
    },
    IsWithinNVZ: {
      type: "bit",
      nullable: true,
      default: 0,
    },
    IsAbove300SeaLevel: {
      type: "bit",
      nullable: true,
      default: 0,
    },
    IsActive: {
      type: "bit",
      default: 1,
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
    Farm: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "Fields",
    },
    Crops: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "Crop",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
    SoilAnalyses: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "SoilAnalysis",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
    PreviousGrasses: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "PreviousGrasses",
      joinColumn: { name: "ID" },
      inverseSide: "Fields",
    },

    CreatedByUser: {
      target: "User",
      type: RELATION_TYPES.MANY_TO_ONE,
      inverseSide: "Fields",
      joinColumn: { name: "CreatedByID" },
    },
    ModifiedByUser: {
      target: "User",
      type: RELATION_TYPES.MANY_TO_ONE,
      inverseSide: "Fields",
      joinColumn: { name: "ModifiedByID" },
    },
    SnsAnalyses: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "SnsAnalyses",
      inverseSide: "Field", // Matches the relation in SnsAnalysesEntity
      joinColumn: {
        name: "FieldID", // This column in SnsAnalyses table refers to the field's ID
      },
    },
    PKBalances: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "PKBalances",
      joinColumn: { name: "ID" },
      inverseSide: "Fields",
    },
    InprogressCalculations: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "InprogressCalculations",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
    WarningMessages: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "WarningMessages",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
    PreviousCropingField: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "PreviousCroppings",
      joinColumn: { name: "ID" },
      inverseSide: "Fields",
    },
  },
});

module.exports = { FieldEntity };
