const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");
const { auditColumns } = require("../../constants/audits-columns");

const SoilAnalysisEntity = new EntitySchema({
  name: "SoilAnalysis",
  tableName: "SoilAnalyses",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generationStrategy: "identity",
    },
    FieldID: {
      type: "int",
    },
    Year: {
      type: "int",
    },
    SulphurDeficient: {
      type: "bit",
      default: 1,
    },
    Date: {
      type: "datetime2",
      nullable: true,
      precision: 7,
    },
    PH: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    PhosphorusMethodologyID: {
      type: "int",
      nullable: true,
    },
    Phosphorus: {
       type: "decimal",
      precision: 18,
      scale: 1,
      nullable: true,
    },
    PhosphorusIndex: {
      type: "tinyint",
      nullable: true,
    },
    Potassium: {
      type: "int",
      nullable: true,
    },
    PotassiumMethodologyID: {
      type: "int",
      nullable: true,
    },
    PotassiumIndex: {
      type: "smallint",
      nullable: true,
    },
    Magnesium: {
      type: "int",
      nullable: true,
    },
    MagnesiumMethodologyID: {
      type: "int",
      nullable: true,
    },
    MagnesiumIndex: {
      type: "tinyint",
      nullable: true,
    },
    SoilNitrogenSupply: {
      type: "int",
      nullable: true,
    },
    SoilNitrogenSupplyIndex: {
      type: "tinyint",
      nullable: true,
    },
    SoilNitrogenSampleDate: {
      type: "datetime2",
      nullable: true,
      precision: 7,
    },
    Sodium: {
      type: "int",
      nullable: true,
    },
    Lime: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    PhosphorusStatus: {
      type: "nvarchar",
      length: 20,
      nullable: true,
    },
    PotassiumStatus: {
      type: "nvarchar",
      length: 20,
      nullable: true,
    },
    MagnesiumStatus: {
      type: "nvarchar",
      length: 20,
      nullable: true,
    },
    NitrogenResidueGroup: {
      type: "nvarchar",
      length: 20,
      nullable: true,
    },

    Comments: {
      type: "nvarchar",
      length: 255,
      nullable: true,
    },
    PreviousID: {
      type: "int",
      nullable: true,
    },
    OrganicMatterPercentage: {
      type: "decimal",
      precision: 4,
      scale: 1,
      nullable: true,
    },
    ...auditColumns,
  },
  relations: {
    Field: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Field",
      inverseSide: "SoilAnalyses",
      joinColumn: {
        name: "FieldID",
      },
    },
    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: {
        name: "CreatedByID",
      },
    },
    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: {
        name: "ModifiedByID",
      },
    },
  },
});

module.exports = { SoilAnalysisEntity };
