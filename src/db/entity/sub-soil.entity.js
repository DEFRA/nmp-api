const { EntitySchema } = require("typeorm");


const SubSoilEntity = new EntitySchema({
  name: "SubSoil",
  tableName: "SubSoils",
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
      inverseSide: "SubSoil",
      joinColumn: { name: "ID" },
    },
    Fields: {
      target: "Field",
      type: "one-to-many",
      inverseSide: "SubSoil",
      joinColumn: { name: "ID" },
    },
  },
});

module.exports = {SubSoilEntity};
