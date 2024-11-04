const { EntitySchema } = require("typeorm");

const FarmManureTypeEntity = new EntitySchema({
  name: "FarmManureType",
  tableName: "FarmManureTypes",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      generatedIdentity: "ALWAYS",
    },
    FarmID: {
      type: "int",
    },
    ManureTypeID: {
      type: "int",
    },
    FieldTypeID: {
      type: "int",
    },
    DryMatter: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    TotalN: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    NH4N: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    Uric: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    NO3N: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    P2O5: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    K2O: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    SO3: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    MgO: {
      type: "decimal",
      precision: 18,
      scale: 2,
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      default: () => "CURRENT_TIMESTAMP",
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
    Farm: {
      type: "many-to-one",
      target: "Farm",
      joinColumn: { name: "FarmID" },
      inverseSide: "FarmManureTypes",
    },
    ManureType: {
      type: "many-to-one",
      target: "ManureType",
      joinColumn: { name: "ManureTypeID" },
      inverseSide: "FarmManureTypes",
    },
  },
});

module.exports = { FarmManureTypeEntity };
