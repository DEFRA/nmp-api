const { EntitySchema } = require("typeorm");

const SecondCropLinkingEntity = new EntitySchema({
  name: "SecondCropLinking",
  tableName: "SecondCropLinkings",
  columns: {
    FirstCropID: {
      type: "int",
      primary: true,

    },
    SecondCropID: {
      type: "int",
      primary: true,

    },
     RB209CountryID: {
      type: "int",
      nullable: false,
    },
  },

});

module.exports = { SecondCropLinkingEntity };
