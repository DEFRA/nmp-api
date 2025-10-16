const { EntitySchema } = require("typeorm");

const PreviousCroppingEntity = new EntitySchema({
  name: "PreviousCroppings",
  tableName: "PreviousCroppings",
  columns: {
    ID: {
      primary: true,
      type: "int",
      generated: true,
    },
    FieldID: {
      type: "int",
      nullable: false,
    },
    CropGroupID: {
      type: "int",
      nullable: true,
    },
    CropTypeID: {
      type: "int",
      nullable: true,
    },
    HasGrassInLastThreeYear: {
      type: "bit",
      nullable: false,
    },
    HarvestYear: {
      type: "int",
      nullable: true,
    },
    LayDuration: {
      type: "int",
      nullable: true,
    },
    GrassManagementOptionID: {
      type: "int",
      nullable: true,
    },
    HasGreaterThan30PercentClover: {
      type: "bit",
      nullable: true,
    },
    SoilNitrogenSupplyItemID: {
      type: "int",
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      nullable: true,
      default: () => "getdate()",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedOn: {
      type: "datetime2",
      nullable: true,
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Fields: {
      type: "many-to-one",
      target: "Fields",
      joinColumn: { name: "FieldID" },
      inverseSide: "PreviousCropingField",
    },
    GrassManagementOptions: {
      type: "many-to-one",
      target: "GrassManagementOptions",
      joinColumn: { name: "GrassManagementOptionID" },
      inverseSide: "PreviousCroppingGrassManagementOption",
    },
    SoilNitrogenSupplyItems: {
      type: "many-to-one",
      target: "SoilNitrogenSupplyItems",
      joinColumn: { name: "SoilNitrogenSupplyItemID" },
      inverseSide: "PreviousCroppingGrassManagementOption",
    },
    CreatedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedPreviousCroppings",
    },
    ModifiedByUser: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedPreviousCroppings",
    },
  },
});
module.exports = { PreviousCroppingEntity };
