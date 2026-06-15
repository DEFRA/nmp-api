const { EntitySchema } = require("typeorm");

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
    MannerEstimation: {
      type: "many-to-one",
      target: "MannerEstimations",
      joinColumn: { name: "MannerEstimationID" },
      inverseSide: "MannerEstimationApplications",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedMannerEstimationApplications",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedMannerEstimationApplications",
    },
  },
});

module.exports = { MannerEstimationApplicationsEntity };
