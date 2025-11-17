const { EntitySchema } = require("typeorm");

const RecommendationEntity = new EntitySchema({
  name: "Recommendation",
  tableName: "Recommendations",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generatedIdentity: "ALWAYS",
    },
    ManagementPeriodID: {
      type: "int",
    },
    CropN: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CropP2O5: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CropK2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CropMgO: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CropSO3: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CropNa2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CropLime: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureN: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureP2O5: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureK2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureMgO: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureSO3: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureNa2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    ManureLime: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    FertilizerN: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    FertilizerP2O5: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    FertilizerK2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    FertilizerMgO: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    FertilizerSO3: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    FertilizerNa2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    FertilizerLime: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    PH: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    SNSIndex: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    PIndex: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    KIndex: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    MgIndex: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    SIndex: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    NaIndex: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    NIndex: {
      type: "nvarchar",
      length: 30,
      nullable: true,
    },
    NBalance: {
      type: "int",
      nullable: true,
    },
    PBalance: {
      type: "int",
      nullable: true,
    },
    KBalance: {
      type: "int",
      nullable: true,
    },
    MgBalance: {
      type: "int",
      nullable: true,
    },
    SBalance: {
      type: "int",
      nullable: true,
    },
    NaBalance: {
      type: "int",
      nullable: true,
    },
    LimeBalance: {
      type: "int",
      nullable: true,
    },
    Comments: {
      type: "nvarchar",
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
    ManagementPeriod: {
      type: "many-to-one",
      target: "ManagementPeriod",
      joinColumn: { name: "ManagementPeriodID" },
      inverseSide: "Recommendations",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedRecommendations",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedRecommendations",
    },
    RecommendationComments: {
      type: "one-to-many",
      target: "RecommendationComment",
      joinColumn: { name: "ID" },
      inverseSide: "Recommendation",
    },
  },
});

module.exports = { RecommendationEntity };
