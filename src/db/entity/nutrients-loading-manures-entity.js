const { EntitySchema } = require("typeorm");

const NutrientsLoadingManuresEntity = new EntitySchema({
  name: "NutrientsLoadingManures",
  tableName: "NutrientsLoadingManures",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    FarmID: {
      type: "int",
      nullable: false,
      name: "FarmID",
    },
    ManureLookupType: {
      type: "nvarchar",
      length: 250,
      nullable: false,
      name: "ManureLookupType",
    },
    ManureTypeID: {
      type: "int",
      nullable: false,
      name: "ManureTypeID",
    },
    ManureType: {
      type: "nvarchar",
      length: 250,
      nullable: false,
      name: "ManureType",
    },
    Quantity: {
      type: "int",
      nullable: false,
      name: "Quantity",
    },
    NContent: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
      name: "NContent",
    },
    NTotal: {
      type: "int",
      nullable: false,
      name: "NTotal",
    },
    PContent: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: false,
      name: "PContent",
    },
    PTotal: {
      type: "int",
      nullable: false,
      name: "PTotal",
    },
    ManureDate: {
      type: "datetime",
      nullable: false,
      name: "ManureDate",
    },
    FarmName: {
      type: "nvarchar",
      length: 50,
      nullable: false,
      name: "FarmName",
    },
    Address1: {
      type: "nvarchar",
      length: 50,
      nullable: true,
      name: "Address1",
    },
    Address2: {
      type: "nvarchar",
      length: 50,
      nullable: true,
      name: "Address2",
    },
    Address3: {
      type: "nvarchar",
      length: 50,
      nullable: true,
      name: "Address3",
    },
    Address4: {
      type: "nvarchar",
      length: 50,
      nullable: true,
      name: "Address4",
    },
    PostCode: {
      type: "nvarchar",
      length: 50,
      nullable: true,
      name: "PostCode",
    },
    Comments: {
      type: "nvarchar",
      length: 255,
      nullable: true,
      name: "Comments",
    },
NH4N: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    NO3N: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    DryMatterPercent: {
      type: "decimal",
      precision: 18,
      scale: 2,
      nullable: true,
    },
    UricAcid: {
      type: "decimal",
      precision: 18,
      scale: 2,
      nullable: false,
    },
    K2O: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    MgO: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    SO3: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      name: "CreatedOn",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
      name: "CreatedByID",
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      name: "ModifiedOn",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
      name: "ModifiedByID",
    },
  },
  relations: {
    Farm: {
      type: "one-to-one",
      target: "Farms",
      joinColumn: { name: "FarmID" },
    },
  },
});

module.exports = { NutrientsLoadingManuresEntity };
