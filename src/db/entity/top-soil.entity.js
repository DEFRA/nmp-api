const { EntitySchema } = require("typeorm");
const SoilTypeSoilTextureEntity = require("./soil-type-soil-texture.entity");
const FieldEntity = require("./field.entity");

const TopSoilEntity = new EntitySchema({
  name: "TopSoil",
  tableName: "TopSoils",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    Name: {
      type: "nvarchar",
      length: 100,
      name: "Name",
    },
  },
  relations: {
    SoilTypeSoilTextures: {
      target: "SoilTypeSoilTexture",
      type: "one-to-many",
      inverseSide: "TopSoil",
      joinColumn: { name: "ID" },
    },
    Fields: {
      target: "Field",
      type: "one-to-many",
      inverseSide: "TopSoil",
      joinColumn: { name: "ID" },
    },
  },
});

module.exports = {TopSoilEntity};
