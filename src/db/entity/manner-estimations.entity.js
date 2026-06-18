const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

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

    OrganisationID: {
      type: "uniqueidentifier",
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
      length: 50,
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

    TopSoilID: {
      type: "int",
      nullable: false,
    },

    SubSoilID: {
      type: "int",
      nullable: false,
    },

    CropTypeID: {
      type: "int",
      nullable: false,
    },

    MannerCropTypeID: {
      type: "int",
      nullable: false,
    },

    SowingDate: {
      type: "datetime2",
      precision: 7,
      nullable: true,
    },

    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      default: () => "GETDATE()",
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
    Country: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Countries",
      joinColumn: {
        name: "CountryID",
      },
      inverseSide: "MannerEstimations",
    },

    MannerEstimationApplications: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "MannerEstimationApplications",
      inverseSide: "MannerEstimation",
    },

    Organisation: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Organisations",
      joinColumn: {
        name: "OrganisationID",
      },
      inverseSide: "MannerEstimations",
    },

    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users", // change to your actual Users entity
      joinColumn: {
        name: "CreatedByID",
      },
      inverseSide: "CreatedMannerEstimations",
      nullable: true,
    },

    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users", // change to your actual Users entity
      joinColumn: {
        name: "ModifiedByID",
      },
      inverseSide: "ModifiedMannerEstimations",
      nullable: true,
    },
  },
});

module.exports = { MannerEstimationsEntity };
