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

    ApplicationMethodID: {
      type: "int",
      nullable: false,
    },

    NH4N: {
      ...nutrientDecimalColumn,
    },

    NO3N: {
      ...nutrientDecimalColumn,
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
      nullable: false,
    },

    CropAvailableNCurrentCrop: {
      type: "int",
      nullable: false,
    },

    CropAvailableNitrogenFollowingCropYearTwo: {
      type: "int",
      nullable: false,
    },

    NextGrassNitrogenCropCurrentYear: {
      type: "int",
      nullable: false,
    },

    TotalP2O5: {
      type: "int",
      nullable: false,
    },

    CropAvailableP2O5: {
      type: "int",
      nullable: false,
    },

    TotalSO3: {
      type: "int",
      nullable: false,
    },

    CropAvailableSO3: {
      type: "int",
      nullable: false,
    },

    TotalMgO: {
      type: "int",
      nullable: false,
    },

    TotalK2O: {
      type: "int",
      nullable: false,
    },

    CropAvailableK2O: {
      type: "int",
      nullable: false,
    },

    NitrogenUseEfficiency: {
      type: "int",
      nullable: true,
    },

    MineralisedNitrogenLosses: {
      type: "int",
      nullable: false,
    },

    LostNitrateLosses: {
      type: "int",
      nullable: false,
    },

    LostAmmonia: {
      type: "int",
      nullable: false,
    },

    LostDenitrified: {
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

    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User", // Change to "Users" if that's your registered entity name
      joinColumn: {
        name: "CreatedByID",
      },
      inverseSide: "CreatedMannerEstimationApplications",
      nullable: true,
    },

    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User", // Change to "Users" if that's your registered entity name
      joinColumn: {
        name: "ModifiedByID",
      },
      inverseSide: "ModifiedMannerEstimationApplications",
      nullable: true,
    },
  },
});

module.exports = { MannerEstimationApplicationsEntity };
