const { EntitySchema } = require("typeorm");

const ScotlandNMaxValuesEntity = new EntitySchema({
  name: "ScotlandNMaxValue",
  tableName: "ScotlandNMaxValues",
  columns: {
    CropTypeID: {
      type: "int", nullable: false,
      primary:true
    },
    SoilTypeID: {
      type: "int",
      nullable: false,
      primary:true
    },
    ResidueGroup1: { type: "int", nullable: false },
    ResidueGroup2: { type: "int", nullable: false },
    ResidueGroup3: { type: "int", nullable: false },
    ResidueGroup4: { type: "int", nullable: false },
    ResidueGroup5: { type: "int", nullable: false },
    ResidueGroup6: { type: "int", nullable: false },
  },
  uniques: [
    {
      columns: ["CropTypeID", "SoilTypeID"],
    },
  ],
});

module.exports = { ScotlandNMaxValuesEntity };