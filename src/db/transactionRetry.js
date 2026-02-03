// src/shared/db/transactionRetry.js

async function runWithDeadlockRetry(fn, options = {}) {
  const { retries = 3, delayMs = 100, backoffMultiplier = 2 } = options;

  try {
    return await fn();
  } catch (error) {
    const driverError = error?.driverError;

    // SQL Server deadlock error number
    if (driverError?.number === 1205 && retries > 0) {
      console.warn(
        `Deadlock detected. Retrying transaction (${retries} left)...`,
      );

      await new Promise((resolve) => setTimeout(resolve, delayMs));

      return runWithDeadlockRetry(fn, {
        retries: retries - 1,
        delayMs: delayMs * backoffMultiplier,
        backoffMultiplier,
      });
    }

    throw error;
  }
}

module.exports = {
  runWithDeadlockRetry,
};
