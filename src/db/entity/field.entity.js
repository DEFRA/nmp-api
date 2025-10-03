const { EntitySchema } = require("typeorm");

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
      type: "many-to-one",
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "Fields",
    },
    Crops: {
      type: "one-to-many",
      target: "Crop",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
    SoilAnalyses: {
      type: "one-to-many",
      target: "SoilAnalysis",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
    PreviousGrasses: {
      type: "one-to-many",
      target: "PreviousGrasses",
      joinColumn: { name: "ID" },
      inverseSide: "Fields",
    },

    CreatedByUser: {
      target: "User",
      type: "many-to-one",
      inverseSide: "Fields",
      joinColumn: { name: "CreatedByID" },
    },
    ModifiedByUser: {
      target: "User",
      type: "many-to-one",
      inverseSide: "Fields",
      joinColumn: { name: "ModifiedByID" },
    },
    SnsAnalyses: {
      type: "one-to-many",
      target: "SnsAnalyses",
      inverseSide: "Field", // Matches the relation in SnsAnalysesEntity
      joinColumn: {
        name: "FieldID", // This column in SnsAnalyses table refers to the field's ID
      },
    },
    PKBalances: {
      type: "one-to-many",
      target: "PKBalances",
      joinColumn: { name: "ID" },
      inverseSide: "Fields",
    },
    InprogressCalculations: {
      type: "one-to-many",
      target: "InprogressCalculations",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
    WarningMessages: {
      type: "one-to-many",
      target: "WarningMessages",
      joinColumn: { name: "ID" },
      inverseSide: "Field",
    },
  },
});

module.exports = { FieldEntity };
