const { EntitySchema } = require("typeorm");

const SoilGroupCategoriesEntity = new EntitySchema({
  name: "SoilGroupCategories",
  tableName: "SoilGroupCategories",
  columns: {
    ID: {
      type: "int",
      primary: true,
      name: "ID",
    },
    SoilTypeID: {
      type: "int",
      nullable: false,
      name: "SoilTypeID",
    },
    SoilGroupDescription: {
      type: "nvarchar",
      length: 50,
      nullable: true,
      name: "SoilGroupDescription",
    },
  },
});

module.exports = { SoilGroupCategoriesEntity };
