const { BackgroundJobQueue } = require("./background-job-queue");

const parseEnvInt = (value, { defaultValue, min }) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    return defaultValue;
  }

  return Math.max(min, parsed);
};

const config = {
  maxConcurrentJobs: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_MAX_CONCURRENCY,
    {
      defaultValue: 1,
      min: 1,
    },
  ),
  deadlockRetries: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_DEADLOCK_RETRIES,
    {
      defaultValue: 4,
      min: 0,
    },
  ),
  deadlockDelayMs: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_DEADLOCK_DELAY_MS,
    {
      defaultValue: 150,
      min: 50,
    },
  ),
  deadlockJitterMs: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_DEADLOCK_JITTER_MS,
    {
      defaultValue: 100,
      min: 0,
    },
  ),
  requeueRetries: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_REQUEUE_RETRIES,
    {
      defaultValue: 2,
      min: 0,
    },
  ),
  requeueDelayMs: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_REQUEUE_DELAY_MS,
    {
      defaultValue: 1000,
      min: 100,
    },
  ),
  lockWaitRetries: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_LOCK_WAIT_RETRIES,
    {
      defaultValue: 2,
      min: 1,
    },
  ),
  lockWaitDelayMs: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_LOCK_WAIT_DELAY_MS,
    {
      defaultValue: 500,
      min: 200,
    },
  ),
  retryCooldownMs: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_RETRY_COOLDOWN_MS,
    {
      defaultValue: 60000,
      min: 5000,
    },
  ),
  staleLockRecoveryEnabled:
    process.env.FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ENABLED === undefined
      ? true
      : process.env.FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ENABLED.toLowerCase() ===
        "true",
  staleLockRecoveryAttempts: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_ATTEMPTS,
    {
      defaultValue: 1,
      min: 0,
    },
  ),
  staleLockRecoveryDelayMs: parseEnvInt(
    process.env.FUTURE_RECOMMENDATION_STALE_LOCK_RECOVERY_DELAY_MS,
    {
      defaultValue: 500,
      min: 200,
    },
  ),
};

const createBackgroundRequestContext = (request) => ({
  headers: {
    authorization: request?.headers?.authorization,
  },
});

const logQueueConfig = () => {
  console.log(
    "Future recommendation queue config:",
    JSON.stringify({
      concurrency: config.maxConcurrentJobs,
      deadlockRetries: config.deadlockRetries,
      deadlockDelayMs: config.deadlockDelayMs,
      deadlockJitterMs: config.deadlockJitterMs,
      requeueRetries: config.requeueRetries,
      requeueDelayMs: config.requeueDelayMs,
      lockWaitRetries: config.lockWaitRetries,
      lockWaitDelayMs: config.lockWaitDelayMs,
      retryCooldownMs: config.retryCooldownMs,
      staleLockRecoveryEnabled: config.staleLockRecoveryEnabled,
      staleLockRecoveryAttempts: config.staleLockRecoveryAttempts,
      staleLockRecoveryDelayMs: config.staleLockRecoveryDelayMs,
    }),
  );
};

const createQueue = (runJob) => {
  logQueueConfig();

  return new BackgroundJobQueue({
    concurrency: config.maxConcurrentJobs,
    getJobKey: (job) => `${job.fieldID}:${job.year}`,
    runJob,
    onDuplicate: (job) => {
      console.log(
        `Job already queued or running for FieldID: ${job.fieldID}, Year: ${job.year}`,
      );
    },
    onSuccess: (job) => {
      console.log(
        `Successfully processed FieldID: ${job.fieldID}, Year: ${job.year}`,
      );
    },
    onError: (job, error) => {
      console.error(
        `Error processing FieldID: ${job.fieldID}, Year: ${job.year}:`,
        error,
      );
    },
  });
};

const runWithFutureDeadlockRetry = (runWithDeadlockRetry, operationName, fn) =>
  runWithDeadlockRetry(fn, {
    retries: config.deadlockRetries,
    delayMs: config.deadlockDelayMs,
    backoffMultiplier: 2,
    jitterMs: config.deadlockJitterMs,
    operationName,
  });

const scheduleJobRequeue = (sharedQueue, job, delayMs) => {
  setTimeout(() => {
    sharedQueue.enqueue(job);
  }, delayMs);
};

const handleDeadlockRequeue = ({
  error,
  isDeadlockError,
  job,
  fieldID,
  year,
  sharedQueue,
}) => {
  if (!isDeadlockError(error)) {
    return false;
  }

  const requeueAttempt = Number.isFinite(job?.requeueAttempt)
    ? job.requeueAttempt
    : 0;

  if (requeueAttempt < config.requeueRetries) {
    const nextAttempt = requeueAttempt + 1;
    const retryDelay = config.requeueDelayMs * Math.pow(2, requeueAttempt);

    console.warn(
      `Deadlock persisted for FieldID: ${fieldID}, Year: ${year}. Requeueing attempt ${nextAttempt}/${config.requeueRetries} in ${retryDelay}ms.`,
    );

    scheduleJobRequeue(
      sharedQueue,
      {
        ...job,
        requeueAttempt: nextAttempt,
        lockWaitAttempt: 0,
        staleLockRecoveryAttempt: 0,
      },
      retryDelay,
    );

    return true;
  }

  console.error(
    `Deadlock persisted for FieldID: ${fieldID}, Year: ${year} after ${requeueAttempt} requeue attempts. Requeueing in cooldown ${config.retryCooldownMs}ms.`,
    error,
  );

  scheduleJobRequeue(
    sharedQueue,
    {
      ...job,
      requeueAttempt: 0,
      lockWaitAttempt: 0,
      staleLockRecoveryAttempt: 0,
    },
    config.retryCooldownMs,
  );

  return true;
};

const handleInProgressContention = async ({
  job,
  fieldID,
  year,
  sharedQueue,
  clearInProgress,
}) => {
  const lockWaitAttempt = Number.isFinite(job?.lockWaitAttempt)
    ? job.lockWaitAttempt
    : 0;

  if (lockWaitAttempt < config.lockWaitRetries) {
    const nextLockWaitAttempt = lockWaitAttempt + 1;
    const waitDelay = config.lockWaitDelayMs * Math.pow(2, lockWaitAttempt);

    console.warn(
      `FieldID: ${fieldID}, Year: ${year} is already in progress. Requeueing lock-wait attempt ${nextLockWaitAttempt}/${config.lockWaitRetries} in ${waitDelay}ms.`,
    );

    scheduleJobRequeue(
      sharedQueue,
      {
        ...job,
        lockWaitAttempt: nextLockWaitAttempt,
      },
      waitDelay,
    );

    return true;
  }

  const staleLockRecoveryAttempt = Number.isFinite(
    job?.staleLockRecoveryAttempt,
  )
    ? job.staleLockRecoveryAttempt
    : 0;

  if (
    config.staleLockRecoveryEnabled &&
    staleLockRecoveryAttempt < config.staleLockRecoveryAttempts
  ) {
    const nextStaleLockRecoveryAttempt = staleLockRecoveryAttempt + 1;

    console.warn(
      `FieldID: ${fieldID}, Year: ${year} appears stuck in-progress after ${lockWaitAttempt} lock retries. Attempting stale lock recovery ${nextStaleLockRecoveryAttempt}/${config.staleLockRecoveryAttempts}.`,
    );

    try {
      await clearInProgress(fieldID, year);
    } catch (cleanupError) {
      console.error(
        `Error clearing stale in-progress lock for FieldID: ${fieldID}, Year: ${year}`,
        cleanupError,
      );
    }

    scheduleJobRequeue(
      sharedQueue,
      {
        ...job,
        lockWaitAttempt: 0,
        staleLockRecoveryAttempt: nextStaleLockRecoveryAttempt,
      },
      config.staleLockRecoveryDelayMs,
    );

    return true;
  }

  console.warn(
    `FieldID: ${fieldID}, Year: ${year} remained locked after ${lockWaitAttempt} retries. Requeueing in cooldown ${config.retryCooldownMs}ms.`,
  );

  scheduleJobRequeue(
    sharedQueue,
    {
      ...job,
      lockWaitAttempt: 0,
      staleLockRecoveryAttempt,
    },
    config.retryCooldownMs,
  );

  return true;
};

module.exports = {
  config,
  createBackgroundRequestContext,
  createQueue,
  runWithFutureDeadlockRetry,
  handleDeadlockRequeue,
  handleInProgressContention,
};
