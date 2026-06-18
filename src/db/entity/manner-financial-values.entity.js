const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const MannerFinancialValuesEntity = new EntitySchema({
  name: "MannerFinancialValues",
  tableName: "MannerFinancialValues",

  columns: {
    Id: {
      type: "int",
      primary: true,
      generated: true,
    },

    MannerEstimationApplicationID: {
      type: "int",
      nullable: false,
    },

    NitrogenValue: {
      type: "int",
      nullable: false,
    },

    PhosphateValue: {
      type: "int",
      nullable: false,
    },

    PotashValue: {
      type: "int",
      nullable: false,
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
      type: "int",
      nullable: false,
    },

    PhosphateProductName: {
      type: "int",
      nullable: false,
    },

    PotashProductName: {
      type: "int",
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
      type: "int",
      nullable: false,
    },

    PhosphatePrice: {
      type: "int",
      nullable: false,
    },

    PotashPrice: {
      type: "int",
      nullable: false,
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
    MannerEstimationApplication: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "MannerEstimationApplications",
      joinColumn: {
        name: "MannerEstimationApplicationID",
      },
      inverseSide: "MannerFinancialValues",
    },

    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users",
      joinColumn: {
        name: "CreatedByID",
      },
      inverseSide: "CreatedMannerFinancialValues",
      nullable: true,
    },

    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Users",
      joinColumn: {
        name: "ModifiedByID",
      },
      inverseSide: "ModifiedMannerFinancialValues",
      nullable: true,
    },
  },
});

module.exports = { MannerFinancialValuesEntity };
