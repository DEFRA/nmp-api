const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const OrganicManureEntity = new EntitySchema({
  name: "OrganicManure",
  tableName: "OrganicManures",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generatedIdentity: "ALWAYS",
      primaryKeyConstraintName: "PK_OrganicManures",
    },
    ManagementPeriodID: {
      type: "int",
      nullable: false,
    },
    ManureTypeID: {
      type: "int",
      nullable: false,
    },
    ManureTypeName: {
      type: "nvarchar",
      length: 250,
    },
    ApplicationDate: {
      type: "datetime",
      nullable: true,
    },
    Confirm: {
      type: "bit",
      nullable: true,
    },
    N: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    P2O5: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    K2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    MgO: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    SO3: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    AvailableN: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    AvailableSO3: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    ApplicationRate: {
      type: "decimal",
      precision: 18,
      scale: 1,
      nullable: false,
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
    EndOfDrain: {
      type: "datetime",
      nullable: true,
    },
    Rainfall: {
      type: "int",
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
      nullable: true,
    },
    IncorporationMethodID: {
      type: "int",
      nullable: true,
    },
    IncorporationDelayID: {
      type: "int",
      nullable: true,
    },
    NH4N: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    NO3N: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
    },
    AvailableP2O5: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    AvailableK2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    WindspeedID: {
      type: "int",
      nullable: true,
    },
    RainfallWithinSixHoursID: {
      type: "int",
      nullable: true,
    },
    MoistureID: {
      type: "int",
      nullable: true,
    },
    AutumnCropNitrogenUptake: {
      type: "int",
      default: 0,
      nullable: true,
    },
    AvailableNForNMax: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      default: () => "GETDATE()",
      nullable: true,
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
    AvailableNForNextYear: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    AvailableNForNextDefoliation: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
  },
  relations: {
    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedOrganicManures",
    },
    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedOrganicManures",
    },
    ManagementPeriod: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "ManagementPeriod",
      joinColumn: { name: "ManagementPeriodID" },
      inverseSide: "OrganicManures",
    },
    ManureType: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "ManureType",
      joinColumn: { name: "ManureTypeID" },
      inverseSide: "OrganicManures",
    },
    ApplicationMethod: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "ApplicationMethod",
      joinColumn: { name: "ApplicationMethodID" },
      inverseSide: "OrganicManures",
    },
    IncorporationMethod: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "IncorporationMethod",
      joinColumn: { name: "IncorporationMethodID" },
      inverseSide: "OrganicManures",
    },
    IncorporationDelay: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "IncorporationDelay",
      joinColumn: { name: "IncorporationDelayID" },
      inverseSide: "OrganicManures",
    },
    Windspeed: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Windspeed",
      joinColumn: { name: "WindspeedID" },
      inverseSide: "OrganicManures",
    },
    RainType: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "RainType",
      joinColumn: { name: "RainfallWithinSixHoursID" },
      inverseSide: "OrganicManures",
    },
    MoistureType: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "MoistureType",
      joinColumn: { name: "MoistureID" },
      inverseSide: "OrganicManures",
    },
  },
});

module.exports = { OrganicManureEntity };
