const { EntitySchema } = require("typeorm");

// Table has no primary key; the unique constraint columns are used as a composite key.
const ScotlandGrassNMaxValuesEntity = new EntitySchema({
  name: "ScotlandGrassNMaxValue",
  tableName: "ScotlandGrassNMaxValues",
  columns: {
    SwardTypeID: { type: "int", nullable: false, primary: true },
    SwardManagementID: { type: "int", nullable: false, primary: true },
    DefoliationSequenceID: { type: "int", nullable: false, primary: true },
    SiteClass1: { type: "int", nullable: false },
    SiteClass2: { type: "int", nullable: false },
    SiteClass3: { type: "int", nullable: false },
    SiteClass4: { type: "int", nullable: false },
    SiteClass5: { type: "int", nullable: false },
  },
  uniques: [
    {
      name: "UQ_ScotlandGrassNMaxValues_SwardTypeID_SwardManagementID_DefoliationSequenceID",
      columns: ["SwardTypeID", "SwardManagementID", "DefoliationSequenceID"],
    },
  ],
});

module.exports = { ScotlandGrassNMaxValuesEntity };
