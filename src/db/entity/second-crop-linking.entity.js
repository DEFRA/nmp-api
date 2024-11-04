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
  },

});

module.exports = { SecondCropLinkingEntity };
