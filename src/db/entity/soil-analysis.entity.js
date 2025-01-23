const { EntitySchema } = require("typeorm");

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
      type: "int",
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
    PotassiumIndex: {
      type: "smallint",
      nullable: true,
    },
    Magnesium: {
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
    PotassiumAnalysis: {
      type: "nvarchar",
      length: 50,
      nullable: true,
    },
    PotassiumStatus: {
      type: "nvarchar",
      length: 20,
      nullable: true,
    },
    MagnesiumAnalysis: {
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
      target: "Field",
      inverseSide: "SoilAnalyses",
      joinColumn: {
        name: "FieldID",
      },
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "CreatedByID",
      },
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "ModifiedByID",
      },
    },
  },
});

module.exports = { SoilAnalysisEntity };
