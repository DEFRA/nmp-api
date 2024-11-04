const { OrganisationEntity } = require("../db/entity/organisation.entity");
 // Assuming you have a data source file
const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");

class OrganisationService extends BaseService {
  constructor() {
    super(OrganisationEntity);
    this.repository = AppDataSource.getRepository(OrganisationEntity);
  }

  async updateOrCreateOrganisation(organisationData) {
    try {
      const storedProcedure =
        "EXEC dbo.spOrganisations_MergeOrganisation @organisationId = @0, @organisationName = @1";
      const organisation = await AppDataSource.query(storedProcedure, [
        organisationData.ID,
        organisationData.Name,
      ]);
      return organisation;
    } catch (error) {
      console.error("Error while updating or creating organisation:", error);
      throw error;
    }
  }
}

module.exports = { OrganisationService };
