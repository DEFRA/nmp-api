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

    RegisteredOrganicProducer: {
      type: "bit",
      default: 0,
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

    NitrogenProductId: {
      type: "int",
      nullable: false,
    },

    PhosphateProductId: {
      type: "int",
      nullable: false,
    },

    PotashProductId: {
      type: "int",
      nullable: false,
    },

    NitrogenProductName: {
      type: "nvarchar",
      length: 100,
      nullable: false,
    },

    PhosphateProductName: {
      type: "nvarchar",
      length: 100,
      nullable: false,
    },

    PotashProductName: {
      type: "nvarchar",
      length: 100,
      nullable: false,
    },

    NitrogenProductPrice: {
      type: "int",
      nullable: false,
    },

    PhosphateProductPrice: {
      type: "int",
      nullable: false,
    },

    PotashProductPrice: {
      type: "int",
      nullable: false,
    },

    NitrogenPrice: {
    type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
    },

    PhosphatePrice: {
     type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
    },

    PotashPrice: {
   type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
    },

    IsNitrogenPriceBasedOnNutrientPrice: {
      type: "bit",
      nullable: false,
      default: true,
    },

     IsPotashPriceBasedOnNutrientPrice: {
      type: "bit",
      nullable: false,
      default: true,
    },

     IsPhosphatePriceBasedOnNutrientPrice: {
      type: "bit",
      nullable: false,
      default: true,
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

    Organisation: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Organisations",
      joinColumn: {
        name: "OrganisationID",
      },
      inverseSide: "MannerEstimations",
    },

    MannerEstimationApplications: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "MannerEstimationApplications",
      joinColumn: {
        name: "ID",
      },
      inverseSide: "MannerEstimation",
    },

    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users",
      joinColumn: {
        name: "CreatedByID",
      },
      inverseSide: "CreatedMannerEstimations",
      nullable: true,
    },

    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users",
      joinColumn: {
        name: "ModifiedByID",
      },
      inverseSide: "ModifiedMannerEstimations",
      nullable: true,
    },
  },
});

module.exports = { MannerEstimationsEntity };
