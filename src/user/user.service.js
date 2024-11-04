const { UserEntity } = require("../db/entity/user.entity");
const { OrganisationService } = require("../organisation/organisation.service");

const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

class UserService extends BaseService {
  constructor() {
    super(UserEntity);
    this.repository = AppDataSource.getRepository(UserEntity);
    this.organisationService = new OrganisationService();
  }

  async updateOrCreateUser(userData) {
    try {
      const storedProcedure =
        "EXEC dbo.spUsers_MergeUser @userIdentifier = @0, @givenName = @1, @surname = @2, @email = @3";
      const user = await AppDataSource.query(storedProcedure, [
        userData.UserIdentifier,
        userData.GivenName,
        userData.Surname,
        userData.Email,
      ]);
      return user;
    } catch (error) {
      console.error("Error while updating or creating user:", error);
      throw error;
    }
  }

  async createUserWithOrganisation(organisation, user) {
    try {
      await this.organisationService.updateOrCreateOrganisation(organisation);
      await this.updateOrCreateUser(user);
      const updatedUser = await this.repository.findOne({
        where: { UserIdentifier: user.UserIdentifier },
      });
      return {
        UserID: updatedUser.ID,
      };
    } catch (error) {
      console.error("Error in createUserWithOrganisation:", error);
      throw error;
    }
  }
}

module.exports = { UserService };
