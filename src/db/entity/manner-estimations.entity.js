const { EntitySchema } = require("typeorm");

const MannerEstimationsEntity = new EntitySchema({
  name: "MannerEstimations",
  tableName: "MannerEstimations",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    Name: {
      type: "nvarchar",
      length: 250,
      nullable: false,
    },
    FarmName: {
      type: "nvarchar",
      length: 250,
      nullable: false,
    },
    CountryID: {
      type: "int",
      nullable: false,
    },
    Postcode: {
      type: "nvarchar",
      length: 50,
      nullable: false,
    },
    AverageAnuualRainfall: {
      type: "int",
      nullable: false,
    },
    FieldName: {
      type: "nvarchar",
      length: 250,
      nullable: false,
    },
    IsWithinNVZ: {
      type: "bit",
      nullable: false,
    },
    NVZProgrammeID: {
      type: "int",
      nullable: true,
    },
    SoilTypeID: {
      type: "int",
      nullable: false,
    },
    CropTypeID: {
      type: "int",
      nullable: false,
    },
    IsEarlySown: {
      type: "bit",
      nullable: true,
    },
    FieldComments: {
      type: "nvarchar",
      length: 250,
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
      default: () => "GETDATE()",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Country: {
      type: "many-to-one",
      target: "Countries",
      joinColumn: { name: "CountryID" },
      inverseSide: "MannerEstimations"
    },
    MannerEstimationApplications: {
      type: "one-to-many",
      target: "MannerEstimationApplications",
      joinColumn: { name: "ID" },
      inverseSide: "MannerEstimation"
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "MannerEstimations",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedMannerEstimations"
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "MannerEstimations",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedMannerEstimations"
    }
  }
});

module.exports = { MannerEstimationsEntity };
