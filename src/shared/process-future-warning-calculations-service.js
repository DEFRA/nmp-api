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

        if (!combinedManures?.length) return;

        for (const manure of combinedManures) {
          let warnings = [];
          const finalWarnings = [];

          if (manure.isFertiliserManure && manure.N > 0) {
            warnings =
              await this.CalculateFutureWarningMessageService.calculateFertiliserWarningMessage(
                transactionalManager,
                manure,
              );
          }

          if (manure.isOrganicManure) {
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
      }),
    );
  }
}

module.exports = {
  ProcessFutureManuresForWarnings,
};
