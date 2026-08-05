const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const MannerFarmsEntity = new EntitySchema({
  name: "MannerFarms",
  tableName: "MannerFarms",

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
  target: "Country",
  joinColumn: {
    name: "CountryID",
  },
  inverseSide: "MannerFarm", // or whatever relation in CountryEntity points back
},

    Organisation: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Organisations",
      joinColumn: {
        name: "OrganisationID",
      },
      inverseSide: "MannerFarm",
    },

    // MannerEstimations: {
    //   type: RELATION_TYPES.ONE_TO_MANY,
    //   target: "MannerEstimations",
    //   joinColumn: {
    //     name: "ID",
    //   },
    //   inverseSide: "MannerFarm",
    // },

    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users",
      joinColumn: {
        name: "CreatedByID",
      },
      inverseSide: "MannerFarm",
      nullable: true,
    },

    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users",
      joinColumn: {
        name: "ModifiedByID",
      },
      inverseSide: "MannerFarm",
      nullable: true,
    },
    //  FarmID: {
    //   type: RELATION_TYPES.MANY_TO_ONE,
    //   target: "MannerEstimations",
    //   joinColumn: {
    //     name: "FarmID",
    //   },
    //   inverseSide: "MannerFarm",
    // },
  },
});

module.exports = { MannerFarmsEntity };
