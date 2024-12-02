const { EntitySchema } = require("typeorm");

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
    ApplicationRate: {
      type: "int",
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
      type: "decimal",
      precision: 5,
      scale: 2,
      default: 0,
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
  },
  relations: {
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedOrganicManures",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedOrganicManures",
    },
    ManagementPeriod: {
      type: "many-to-one",
      target: "ManagementPeriod",
      joinColumn: { name: "ManagementPeriodID" },
      inverseSide: "OrganicManures",
    },
    ManureType: {
      type: "many-to-one",
      target: "ManureType",
      joinColumn: { name: "ManureTypeID" },
      inverseSide: "OrganicManures",
    },
    ApplicationMethod: {
      type: "many-to-one",
      target: "ApplicationMethod",
      joinColumn: { name: "ApplicationMethodID" },
      inverseSide: "OrganicManures",
    },
    IncorporationMethod: {
      type: "many-to-one",
      target: "IncorporationMethod",
      joinColumn: { name: "IncorporationMethodID" },
      inverseSide: "OrganicManures",
    },
    IncorporationDelay: {
      type: "many-to-one",
      target: "IncorporationDelay",
      joinColumn: { name: "IncorporationDelayID" },
      inverseSide: "OrganicManures",
    },
    Windspeed: {
      type: "many-to-one",
      target: "Windspeed",
      joinColumn: { name: "WindspeedID" },
      inverseSide: "OrganicManures",
    },
    RainType: {
      type: "many-to-one",
      target: "RainType",
      joinColumn: { name: "RainfallWithinSixHoursID" },
      inverseSide: "OrganicManures",
    },
    MoistureType: {
      type: "many-to-one",
      target: "MoistureType",
      joinColumn: { name: "MoistureID" },
      inverseSide: "OrganicManures",
    },
  },
});

module.exports = { OrganicManureEntity };
