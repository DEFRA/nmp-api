const { AppDataSource } = require("../db/data-source");
const { runWithDeadlockRetry } = require("../db/transactionRetry");
const { CalculateFutureWarningMessageService } = require("./calculate-warning-messages-future-years");
const { CreateOrUpdateWarningMessage } = require("./create-update-warning-messages.service");

class ProcessFutureManuresForWarnings {
  constructor() {
    this.CreateOrUpdateWarningMessage = new CreateOrUpdateWarningMessage();
    this.CalculateFutureWarningMessageService =
      new CalculateFutureWarningMessageService();
  }

  async processCombinedManures(combinedManures, transactionalManager, userId) {
    if (!Array.isArray(combinedManures) || !combinedManures.length){ 
      return
    }
   for (const manure of combinedManures) {
      let warnings = [];
      const finalWarnings = [];

      if (manure.IsFertiliserManure && manure.N > 0) {
        warnings =
          await this.CalculateFutureWarningMessageService.calculateFertiliserWarningMessage(
            transactionalManager,
            manure,
          );
      }

      if (manure.IsOrganicManure && manure.N > 0) {
        warnings =
          await this.CalculateFutureWarningMessageService.calculateOrganicManureWarningMessage(
            transactionalManager,
            manure,
          );
      }

      if (Array.isArray(warnings)) {
        finalWarnings.push(...warnings);
      }

      await this.CreateOrUpdateWarningMessage.syncWarningMessages(
        manure.ManagementPeriodID,
        manure,
        finalWarnings,
        transactionalManager,
        userId,
      );
    }
  }

  async ProcessFutureManures(
    fieldId,
    applicationDate,
    isCurrentOrganicManure,
    isCurrentFertiliser,
    excludeId,
    userId,
  ) {
    return runWithDeadlockRetry(() =>
      AppDataSource.transaction(async (transactionalManager) => {
        const combinedManures = await transactionalManager.query(
         `EXEC spWarning_GetAllManuresByField
         @FieldID = @0,
         @ApplicationDate = @1,
         @IsCurrentOrganicManure = @2,
         @IsCurrentFertiliser = @3,
         @ExcludeID = @4`,
          [
            fieldId,
            applicationDate,
            isCurrentOrganicManure ? 1 : 0,
            isCurrentFertiliser ? 1 : 0,
            excludeId,
          ],
        );

        await this.processCombinedManures(
          combinedManures,
          transactionalManager,
          userId,
        );
      }),
    );
  }

  /* ============== FIELD-LEVEL PROCESSING ================================ */
  async processWarningsByField(fieldId, userId) {
    return runWithDeadlockRetry(() =>
      AppDataSource.transaction(async (transactionalManager) => {
        const combinedManures = await transactionalManager.query(
          `EXEC spWarning_GetAllManuresByFieldOnly @FieldID = @0`,
          [fieldId],
        );

        await this.processCombinedManures(
          combinedManures,
          transactionalManager,
          userId,
        );
      }),
    );
  }

  /* =====================FARM-LEVEL PROCESSING ========================== */
  async processWarningsByFarm(farmId, userId) {
    return runWithDeadlockRetry(() =>
      AppDataSource.transaction(async (transactionalManager) => {
        const combinedManures = await transactionalManager.query(
          `EXEC spWarning_GetAllManuresByFarm @FarmID = @0`,
          [farmId],
        );

        await this.processCombinedManures(
          combinedManures,
          transactionalManager,
          userId,
        );
      }),
    );
  }

  /* ==================CROP-LEVEL PROCESSING ====================== */
  async processWarningsByCrop(cropId, userId) {
    return runWithDeadlockRetry(() =>
      AppDataSource.transaction(async (transactionalManager) => {
        const combinedManures = await transactionalManager.query(
          `EXEC spWarning_GetAllManuresByCrop @CropID = @0`,
          [cropId],
        );
        console.log("combinedManuresbycrops", combinedManures);

        await this.processCombinedManures(
          combinedManures,
          transactionalManager,
          userId,
        );
      }),
    );
  }
}

module.exports = {
  ProcessFutureManuresForWarnings,
};
