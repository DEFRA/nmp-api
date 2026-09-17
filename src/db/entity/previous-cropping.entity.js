const { EntitySchema } = require("typeorm");
const { auditColumns } = require("../../constants/audits-columns");
const {
  previousRelations,
} = require("../../constants/previous-grass-entitiy-relations");

const previousCroppingInverseSides = {
  Fields: "PreviousCropingField",
  GrassManagementOptions: "PreviousCroppingGrassManagementOption",
  SoilNitrogenSupplyItems: "PreviousCroppingGrassManagementOption",
  CreatedByUser: "CreatedPreviousCroppings",
  ModifiedByUser: "ModifiedPreviousCroppings",
};

const previousCroppingTargetOverrides = {
  Fields: "Fields",
};

const previousCroppingRelations = Object.fromEntries(
  Object.entries(previousCroppingInverseSides).map(
    ([relationName, inverseSide]) => {
      const overrides = {
        inverseSide,
        ...(previousCroppingTargetOverrides[relationName] && {
          target: previousCroppingTargetOverrides[relationName],
        }),
      };

      return [
        relationName,
        {
          ...previousRelations[relationName],
          ...overrides,
        },
      ];
    },
  ),
);

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
    CropInfo1: {
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
    PreviousGrassID: {
      type: "int",
      nullable: true,
    },
    ...auditColumns,
  },
  relations: {
    ...previousRelations,
    ...previousCroppingRelations,
  },
});
module.exports = { PreviousCroppingEntity };
