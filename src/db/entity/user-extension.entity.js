const { EntitySchema } = require("typeorm");

const UserExtensionsEntity = new EntitySchema({
  name: "UserExtensions",
  tableName: "UserExtensions",
  columns: {
    UserID: {
      type: "int",
      primary: true,
      name: "UserID",
    },
    IsTermsOfUseAccepted: {
      type: "bit",
      nullable: false,
      name: "IsTermsOfUseAccepted",
    },
    DoNotShowAboutThisService: {
      type: "bit",
      nullable: false,
      name: "DoNotShowAboutThisService",
    },
    DoNotShowAboutManner: {
      type: "bit",
      nullable: false,
      name: "DoNotShowAboutManner",
    },
  },
  relations: {
    User: {
      type: "many-to-one",
      target: "User",
      inverseSide: "UserExtensions",
      joinColumn: { name: "UserID" },
    },
  },
});

module.exports = { UserExtensionsEntity };
