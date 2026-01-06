const { EntitySchema } = require("typeorm");

const WarningMessagesEntity = new EntitySchema({
  name: "WarningMessages",
  tableName: "WarningMessages",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
      name: "ID",
    },
    FieldID: {
      type: "int",
      nullable: false,
      name: "FieldID",
    },
    CropID: {
      type: "int",
      nullable: false,
      name: "CropID",
    },
    JoiningID: {
      type: "int",
      nullable: false,
      name: "JoiningID",
    },
    Header: {
      type: "nvarchar",
      length: 250,
      nullable: true,
      name: "Header",
    },
    Para1: {
      type: "nvarchar",
      nullable: true,
      name: "Para1",
    },
    Para2: {
      type: "nvarchar",
      nullable: true,
      name: "Para2",
    },
    Para3: {
      type: "nvarchar",
      nullable: true,
      name: "Para3",
    },
    WarningCodeID: {
      type: "int",
      nullable: false,
      name: "WarningCodeID",
    },
    WarningLevelID: {
      type: "int",
      nullable: false,
      name: "WarningLevelID",
    },
    CreatedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      default: () => "getdate()",
      name: "CreatedOn",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
      name: "CreatedByID",
    },
    ModifiedOn: {
      type: "datetime2",
      precision: 7,
      nullable: true,
      name: "ModifiedOn",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
      name: "ModifiedByID",
    },
    PreviousID: {
      type: "int",
      nullable: true,
      name: "PreviousID",
    },
  },
  relations: {
    Field: {
      type: "many-to-one",
      target: "Field",
      joinColumn: { name: "FieldID" },
      inverseSide: "WarningMessages",
    },
    Crop: {
      type: "many-to-one",
      target: "Crop",
      joinColumn: { name: "CropID" },
      inverseSide: "WarningMessages",
    },
    WarningCode: {
    type: "many-to-one",
    target: "WarningCode",
    joinColumn: { name: "WarningCodeID" },
    inverseSide: "WarningMessages",
    },
    // WarningLevel: {
    //   type: "many-to-one",
    //   target: "WarningLevels",
    //   joinColumn: { name: "WarningLevelID" },
    // },
    CreatedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "CreatedByID" },
      inverseSide: "CreatedWarningMessagesByUser",
    },
    ModifiedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "ModifiedByID" },
      inverseSide: "ModifiedWarningMessagesByUser",
    },
  },
});

module.exports = { WarningMessagesEntity };
