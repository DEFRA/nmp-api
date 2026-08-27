const createFutureRecommendationInprogressLock = ({
  AppDataSource,
  InprogressCalculationsEntity,
  runWithDeadlockRetry,
  runWithFutureDeadlockRetry,
}) => {
  const duplicateKeyErrorNumber = 2627;
  const uniqueConstraintErrorNumber = 2601;

  const markInProgress = async (fieldID, year, transactionalManager) => {
    try {
      await transactionalManager.insert(InprogressCalculationsEntity, {
        FieldID: fieldID,
        Year: year,
      });
      return true;
    } catch (error) {
      const driverNumber = error?.driverError?.number ?? error?.number;
      if (
        driverNumber === duplicateKeyErrorNumber ||
        driverNumber === uniqueConstraintErrorNumber
      ) {
        return false;
      }

      throw error;
    }
  };

  const deleteInProgress = (fieldID, year, transactionalManager) =>
    transactionalManager.delete(InprogressCalculationsEntity, {
      FieldID: fieldID,
      Year: year,
    });

  const clearInProgress = async (fieldID, year) =>
    runWithFutureDeadlockRetry(
      runWithDeadlockRetry,
      "future-recommendation-clear-in-progress",
      () => deleteInProgress(fieldID, year, AppDataSource.manager),
    );

  const acquireInProgressSlot = async (fieldID, year) =>
    runWithFutureDeadlockRetry(
      runWithDeadlockRetry,
      "future-recommendation-acquire-in-progress",
      async () => {
        const acquired = await markInProgress(
          fieldID,
          year,
          AppDataSource.manager,
        );
        if (acquired) {
          return true;
        }

        await deleteInProgress(fieldID, year, AppDataSource.manager);
        return markInProgress(fieldID, year, AppDataSource.manager);
      },
    );

  return {
    acquireInProgressSlot,
    clearInProgress,
  };
};

module.exports = {
  createFutureRecommendationInprogressLock,
};
