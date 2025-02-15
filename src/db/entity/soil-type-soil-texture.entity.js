const { EntitySchema } = require("typeorm");
const TopSoilEntity = require("./top-soil.entity");
const SubSoilEntity = require("./sub-soil.entity");


const SoilTypeSoilTextureEntity = new EntitySchema({
  name: "SoilTypeSoilTexture",
  tableName: "SoilTypeSoilTextures",
  columns: {
    SoilTypeID: {
      type: "int",
      primary: true,
      name: "SoilTypeID",
    },
    TopSoilID: {
      type: "int",
      name: "TopSoilID",
    },
    SubSoilID: {
      type: "int",
      name: "SubSoilID",
    },
  },
  
});

module.exports = { SoilTypeSoilTextureEntity };
