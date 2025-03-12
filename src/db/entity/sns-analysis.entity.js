const { EntitySchema } = require("typeorm");
//const CropEntity = require("./crop.entity");
const UserEntity = require("./user.entity");

const SnsAnalysesEntity = new EntitySchema({
  name: "SnsAnalyses",
  tableName: "SnsAnalyses",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
    },
    CropID: {
      type: "int",
    },
    SampleDate: {
      type: "datetime2",
      nullable: true,
      precision: 7,
    },
    SnsAt0to30cm: {
      type: "int",
      nullable: true,
    },
    SnsAt30to60cm: {
      type: "int",
      nullable: true,
    },
    SnsAt60to90cm: {
      type: "int",
      nullable: true,
    },
    SampleDepth: {
      type: "int",
      nullable: true,
    },
    SoilMineralNitrogen: {
      type: "int",
      nullable: true,
    },
    NumberOfShoots: {
      type: "int",
      nullable: true,
    },
    GreenAreaIndex: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CropHeight: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    SeasonId: {
      type: "int",
      nullable: true,
    },
    CropTypeID: {
      type: "int",
    },
    PercentageOfOrganicMatter: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    AdjustmentValue: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    SoilNitrogenSupplyValue: {
      type: "int",
      nullable: true,
    },
    SoilNitrogenSupplyIndex: {
      type: "tinyint",
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
      default: () => "GETDATE()",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Crops: {
      type: "many-to-one",
      target: "Crop",
      joinColumn: { name: "CropID" },
      inverseSide: "CropIDSnsAnalyses",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User", // reference to UserEntity
      inverseSide: "CreatedSnsAnalyses", // the one-to-many relation defined in UserEntity
      joinColumn: {
        name: "CreatedByID",
      },
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      inverseSide: "ModifiedSnsAnalyses", // the one-to-many relation defined in UserEntity
      joinColumn: {
        name: "ModifiedByID",
      },
    },
  },
});

module.exports = { SnsAnalysesEntity };
