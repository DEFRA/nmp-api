const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");
const { auditColumns } = require("../../constants/audits-columns");
const { previousRelations } = require("../../constants/previous-grass-entitiy-relations");

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
  ...auditColumns
  },
  relations: {
  ...previousRelations,

  Fields: {
    ...previousRelations.Fields,
    target: "Fields",
    inverseSide: "PreviousCropingField",
  },
  GrassManagementOptions: {
    ...previousRelations.GrassManagementOptions,
    inverseSide: "PreviousCroppingGrassManagementOption",
  },
  SoilNitrogenSupplyItems: {
    ...previousRelations.SoilNitrogenSupplyItems,
    inverseSide: "PreviousCroppingGrassManagementOption",
  },
  CreatedByUser: {
    ...previousRelations.CreatedByUser,
    inverseSide: "CreatedPreviousCroppings",
  },
  ModifiedByUser: {
    ...previousRelations.ModifiedByUser,
    inverseSide: "ModifiedPreviousCroppings",
  },
}
});
module.exports = { PreviousCroppingEntity };
