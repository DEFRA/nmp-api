const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

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
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Fields",
      joinColumn: { name: "FieldID" },
      inverseSide: "PreviousCropingField",
    },
    GrassManagementOptions: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "GrassManagementOptions",
      joinColumn: { name: "GrassManagementOptionID" },
      inverseSide: "PreviousCroppingGrassManagementOption",
    },
    SoilNitrogenSupplyItems: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "SoilNitrogenSupplyItems",
      joinColumn: { name: "SoilNitrogenSupplyItemID" },
      inverseSide: "PreviousCroppingGrassManagementOption",
    },
    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedPreviousCroppings",
    },
    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedPreviousCroppings",
    },
  },
});
module.exports = { PreviousCroppingEntity };
