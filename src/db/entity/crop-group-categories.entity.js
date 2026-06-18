const { EntitySchema } = require("typeorm");

const CropGroupCategoriesEntity = new EntitySchema({
  name: "CropGroupCategories",
  tableName: "CropGroupCategories",
  columns: {
    ID: {
      type: "int",
      primary: true,
      name: "ID",
    },
    CropTypeID: {
      type: "int",
      nullable: false,
      name: "CropTypeID",
    },
    CropGroupDescription: {
      type: "nvarchar",
      length: 50,
      nullable: true,
      name: "CropGroupDescription",
    },
  },
  relations: {
    CropTypes: {
      type: "one-to-one",
      target: "Crop",
      joinColumn: { name: "CropTypeID" },
      inverseSide: "CropType",
    },
  },
});

module.exports = { CropGroupCategoriesEntity };
