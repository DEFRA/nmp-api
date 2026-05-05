const { EntitySchema } = require("typeorm");
const { RELATION_TYPES } = require("../../constants/relations-mapper");

const PKBalanceEntity = new EntitySchema({
  name: "PKBalance",
  tableName: "PKBalances",
  columns: {
    ID: {
      type: "int",
      primary: true,
      generated: true,
    },
    FieldID: {
      type: "int",
    },
    Year: {
      type: "int",
    },
    PBalance: {
      type: "int",
      nullable: true,
    },
    KBalance: {
      type: "int",
      nullable: true,
    },
    CreatedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
      default: "GETDATE()",
    },
    CreatedByID: {
      type: "int",
      nullable: true,
    },
    ModifiedOn: {
      type: "datetime2",
      nullable: true,
      precision: 7,
      default: "GETDATE()",
    },
    ModifiedByID: {
      type: "int",
      nullable: true,
    },
  },
  relations: {
    Field: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "Field",
      inverseSide: "PKBalances",
      joinColumn: {
        name: "FieldID",
      },
    },
    CreatedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: {
        name: "CreatedByID",
      },
    },
    ModifiedByUser: {
      type: RELATION_TYPES.MANY_TO_ONE,
      target: "User",
      joinColumn: {
        name: "ModifiedByID",
      },
    },
  },
});


module.exports = { PKBalanceEntity };