const { EntitySchema } = require("typeorm");

const NutrientsLoadingManuresEntity = new EntitySchema({
  name: "NutrientsLoadingManures",
  tableName: "NutrientsLoadingManures",
  columns: {
    Id: {
      type: "int",
      primary: true,
      generated: true,
      name: "Id",
    },
    FarmId: {
      type: "int",
      nullable: false,
      name: "FarmId",
    },
    ManureLookupType: {
      type: "nvarchar",
      length: 250,
      nullable: true,
      name: "ManureLookupType",
    },
    ManureTypeId: {
      type: "int",
      nullable: true,
      name: "ManureTypeId",
    },
    ManureType: {
      type: "nvarchar",
      length: 250,
      nullable: true,
      name: "ManureType",
    },
    Quantity: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "Quantity",
    },
    NContent: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "NContent",
    },
    NTotal: {
      type: "int",
      nullable: true,
      name: "NTotal",
    },
    PContent: {
      type: "decimal",
      precision: 18,
      scale: 3,
      nullable: true,
      name: "PContent",
    },
    PTotal: {
      type: "int",
      nullable: true,
      name: "PTotal",
    },
    ManureDate: {
      type: "datetime",
      nullable: true,
      name: "ManureDate",
    },
    FarmName: {
      type: "nvarchar",
      length: 50,
      nullable: true,
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
  },
});

module.exports = { NutrientsLoadingManuresEntity };
