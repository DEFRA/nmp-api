const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const nutrientDecimalColumn = {
  type: "decimal",
  precision: 18,
  scale: 3,
  nullable: false,
};

const MannerEstimationApplicationsEntity = new EntitySchema({
  name: "MannerEstimationApplications",
  tableName: "MannerEstimationApplications",

  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },

    MannerEstimationID: {
      type: "int",
      nullable: false,
    },

    ManureTypeID: {
      type: "int",
      nullable: false,
    },

    ApplicationDate: {
      type: "datetime",
      nullable: false,
    },

    N: {
      ...nutrientDecimalColumn,
    },

    P2O5: {
      ...nutrientDecimalColumn,
    },

    K2O: {
      ...nutrientDecimalColumn,
    },

    MgO: {
      ...nutrientDecimalColumn,
    },

    SO3: {
      ...nutrientDecimalColumn,
    },

    DryMatterPercent: {
      type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
    },

    UricAcid: {
      type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
    },

    ApplicationRate: {
      type: "decimal",
      precision: 18,
      scale: 1,
      nullable: false,
    },

    AreaSpread: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },

    ManureQuantity: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },

    IncorporationMethodID: {
      type: "int",
      nullable: false,
    },

    IncorporationDelayID: {
      type: "int",
      nullable: false,
    },

    WindspeedID: {
      type: "int",
      nullable: false,
    },

    RainfallWithinSixHoursID: {
      type: "int",
      nullable: false,
    },

    MoistureID: {
      type: "int",
      nullable: false,
    },

    AutumnCropNitrogenUptake: {
      type: "int",
      nullable: false,
    },

    EndOfDrainageDate: {
      type: "datetime",
      nullable: false,
    },

    RainfallPostApplication: {
      type: "int",
      nullable: false,
    },

    TotalN: {
      type: "int",
      nullable: true,
    },

    TotalP2O5: {
      type: "int",
      nullable: true,
    },

    TotalSO3: {
      type: "int",
      nullable: true,
    },

    TotalMgO: {
      type: "int",
      nullable: true,
    },

    TotalK2O: {
      type: "int",
      nullable: true,
    },

    CropAvailableNCurrentCrop: {
      type: "int",
      nullable: true,
    },

    CropAvailableNitrogenFollowingCropYearTwo: {
      type: "int",
      nullable: true,
    },

    NitrogenUseEfficiency: {
      type: "int",
      nullable: true,
    },

    MineralisedNitrogenLosses: {
      type: "int",
      nullable: true,
    },
    CropAvailableP2O5: {
      type: "int",
      nullable: false,
    },
    CropAvailableK2O: {
      type: "int",
      nullable: false,
    },
    LostNitrateLosses: {
      type: "int",
      nullable: true,
    },

    LostAmmonia: {
      type: "int",
      nullable: true,
    },

    LostDenitrified: {
      type: "int",
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
    MannerEstimation: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "MannerEstimations",
      joinColumn: {
        name: "MannerEstimationID",
      },
      inverseSide: "MannerEstimationApplications",
    },

    MannerFinancialValues: {
      type: RELATION_TYPES.ONE_TO_MANY,
      target: "MannerEstimationFinancialValues",
      joinColumn: {
        name: "ID",
      },
      inverseSide: "MannerEstimationApplication",
    },

    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: {
        name: "CreatedByID",
      },
      inverseSide: "CreatedMannerEstimationApplications",
      nullable: true,
    },

    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: {
        name: "ModifiedByID",
      },
      inverseSide: "ModifiedMannerEstimationApplications",
      nullable: true,
    },
  },
});

module.exports = { MannerEstimationApplicationsEntity };
