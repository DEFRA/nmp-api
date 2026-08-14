// src/shared/db/transactionRetry.js

const DEADLOCK_ERROR_NUMBER = 1205;

function isDeadlockError(error) {
  const driverError = error?.driverError;
  const errorNumber = error?.number;
  const driverErrorNumber = driverError?.number;
  const errorCode = String(error?.code ?? "").toUpperCase();
  const driverErrorCode = String(driverError?.code ?? "").toUpperCase();
  const message = String( error?.message ?? driverError?.message ?? "").toLowerCase();
  const hasDeadlockCode = errorCode === "EREQUEST" || driverErrorCode === "EREQUEST";
  return (
    errorNumber === DEADLOCK_ERROR_NUMBER ||
    driverErrorNumber === DEADLOCK_ERROR_NUMBER ||
    (hasDeadlockCode && message.includes("deadlock")) ||
    message.includes("deadlock victim")
  );
}
async function runWithDeadlockRetry(fn, options = {}) {
  const {
    retries = 3,
    delayMs = 100,
    backoffMultiplier = 2,
    jitterMs = 50,
    operationName = "transaction",
  } = options;
  try {
    return await fn();
  } catch (error) {
    if (isDeadlockError(error) && retries > 0) {
      const deterministicJitter =
        jitterMs > 0 ? Date.now() % (jitterMs + 1) : 0;
      const nextDelay = delayMs + deterministicJitter;
      console.warn(
        `Deadlock detected in ${operationName}. Retrying transaction (${retries} left) in ${nextDelay}ms...`,
      );

      await new Promise((resolve) => setTimeout(resolve, nextDelay));

      return runWithDeadlockRetry(fn, {
        retries: retries - 1,
        delayMs: delayMs * backoffMultiplier,
        backoffMultiplier,
        jitterMs,
        operationName,
      });
    }

    throw error;
  }
}

module.exports = {
  runWithDeadlockRetry,
  isDeadlockError,
};
