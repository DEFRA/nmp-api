const { EntitySchema } = require("typeorm");
const FieldEntity = require("./field.entity");
const UserEntity = require("./user.entity");

const SnsAnalysesEntity = new EntitySchema({
  name: "SnsAnalyses",
  tableName: "SnsAnalyses",
  columns: {
    Id: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
      primaryKeyConstraintName: "PK_SnsAnalyses",
    },
    FieldID: {
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
    CurrentCropTypeID: {
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
    Field: {
      type: "many-to-one",
      target: "Field", // reference to FieldEntity
      inverseSide: "SnsAnalyses",
      joinColumn: {
        name: "FieldID", // the one-to-many relation defined in FieldEntity
      },
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
