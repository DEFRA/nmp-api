const { BaseService } = require("../base/base.service");
const { AppDataSource } = require("../db/data-source");
const { UserExtensionsEntity } = require("../db/entity/user-extension.entity");

class UserExtensionService extends BaseService {
  constructor() {
    super(UserExtensionsEntity);
    this.repository = AppDataSource.getRepository(UserExtensionsEntity);
  }

  // Method to update or create UserExtensions record with transaction
  async updateIsTermsOfUseAccepted(updatedIsTermsOfUseAccepted, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if record exists within the transaction
      const existingRecord = await this.repository.findOne({
        where: { UserID: userId },
      });
      if (existingRecord) {
        // Update the existing record
        const { DoNotShowAboutThisService } = existingRecord;
        await transactionalManager.update(
          UserExtensionsEntity,
          { UserID: userId }, // Where clause
          {
            ...updatedIsTermsOfUseAccepted,
            DoNotShowAboutThisService: DoNotShowAboutThisService,
          },
        );
      } else {
        // Create a new record if it doesn't exist
        const newRecord = this.repository.create({
          ...updatedIsTermsOfUseAccepted,
          UserID: userId,
          DoNotShowAboutThisService: false,
        });
        await transactionalManager.save(UserExtensionsEntity, newRecord);
      }

      // Return the updated or newly created record
      return await transactionalManager.findOne(UserExtensionsEntity, {
        where: { UserID: userId },
      });
    });
  }
  async updateDoNotShowAboutThisService(
    updateDoNotShowAboutThisService,
    userId,
  ) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if record exists within the transaction
      const existingRecord = await this.repository.findOne({
        where: { UserID: userId },
      });
      if (existingRecord) {
        const { IsTermsOfUseAccepted } = existingRecord;
        // Update the existing record
        await transactionalManager.update(
          UserExtensionsEntity,
          { UserID: userId }, // Where clause
          {
            ...updateDoNotShowAboutThisService,
            IsTermsOfUseAccepted: IsTermsOfUseAccepted,
          },
        );
      } else {
        // Create a new record if it doesn't exist
        const newRecord = this.repository.create({
          ...updateDoNotShowAboutThisService,
          IsTermsOfUseAccepted: false,
          UserID: userId,
        });
        await transactionalManager.save(UserExtensionsEntity, newRecord);
      }

      // Return the updated or newly created record
      return await transactionalManager.findOne(UserExtensionsEntity, {
        where: { UserID: userId },
      });
    });
  }
  async doNotShowAboutManner(doNotShowAboutManner, userId) {
    return await AppDataSource.transaction(async (transactionalManager) => {
      // Check if record exists within the transaction
      const existingRecord = await this.repository.findOne({
        where: { UserID: userId },
      });
      if (existingRecord) {
        const { DoNotShowAboutManner } = existingRecord;
        // Update the existing record
        await transactionalManager.update(
          UserExtensionsEntity,
          { UserID: userId }, // Where clause
          {
            ...doNotShowAboutManner,
            DoNotShowAboutManner: DoNotShowAboutManner,
          },
        );
      } else {
        // Create a new record if it doesn't exist
        const newRecord = this.repository.create({
          ...doNotShowAboutManner,
          DoNotShowAboutManner: false,
          UserID: userId,
        });
        await transactionalManager.save(UserExtensionsEntity, newRecord);
      }

      // Return the updated or newly created record
      return await transactionalManager.findOne(UserExtensionsEntity, {
        where: { UserID: userId },
      });
    });
  }
  async getUserExtensionByUserId(userId) {
    const userExtension = await this.repository.findOneBy({
      UserID: userId,
    });
    return {
      UserExtension: userExtension,
    };
  }
}

module.exports = { UserExtensionService };
