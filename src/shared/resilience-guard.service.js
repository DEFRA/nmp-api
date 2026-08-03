const circuitStateByKey = new Map();
const concurrencyStateByKey = new Map();

const getPositiveIntFromEnv = (envName, fallbackValue) => {
  const rawValue = process.env[envName];
  const parsedValue = Number.parseInt(rawValue, 10);

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  return fallbackValue;
};

const wait = async (delayMs) => {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
};

const runWithRetry = async (
  operation,
  {
    retries = 0,
    baseDelayMs = 100,
    backoffMultiplier = 2,
    shouldRetry = () => false,
  } = {},
) => {
  let lastError;
  let delayMs = baseDelayMs;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const canRetry = attempt < retries && shouldRetry(error);

      if (!canRetry) {
        throw error;
      }

      await wait(delayMs);
      delayMs *= backoffMultiplier;
    }
  }

  throw lastError;
};

const getConcurrencyState = (key) => {
  if (!concurrencyStateByKey.has(key)) {
    concurrencyStateByKey.set(key, {
      activeCount: 0,
      pendingResolvers: [],
    });
  }

  return concurrencyStateByKey.get(key);
};

const runWithConcurrencyLimit = async (key, maxConcurrency, operation) => {
  if (!Number.isFinite(maxConcurrency) || maxConcurrency <= 0) {
    return operation();
  }

  const state = getConcurrencyState(key);

  const acquire = async () => {
    if (state.activeCount < maxConcurrency) {
      state.activeCount += 1;
      return;
    }

    await new Promise((resolve) => {
      state.pendingResolvers.push(resolve);
    });
    state.activeCount += 1;
  };

  const release = () => {
    state.activeCount = Math.max(0, state.activeCount - 1);
    const nextResolver = state.pendingResolvers.shift();
    if (nextResolver) {
      nextResolver();
    }
  };

  await acquire();

  try {
    return await operation();
  } finally {
    release();
  }
};

const getCircuitState = (key) => {
  if (!circuitStateByKey.has(key)) {
    circuitStateByKey.set(key, {
      consecutiveFailures: 0,
      openUntilMs: 0,
    });
  }

  return circuitStateByKey.get(key);
};

const buildCircuitOpenError = (retryAfterMs) => {
  const error = new Error("Circuit is open");
  error.code = "CIRCUIT_OPEN";
  error.retryAfterMs = retryAfterMs;
  return error;
};

const isRetryableHttpError = (error) => {
  if (!error) {
    return false;
  }

  const retryableCodes = [
    "ECONNABORTED",
    "ETIMEDOUT",
    "ECONNRESET",
    "EPIPE",
    "ENOTFOUND",
    "EAI_AGAIN",
    "ECONNREFUSED",
  ];

  if (retryableCodes.includes(error.code)) {
    return true;
  }

  const statusCode = error.response?.status;
  return (
    statusCode === 408 ||
    statusCode === 425 ||
    statusCode === 429 ||
    statusCode >= 500
  );
};

const runResilientOperation = async ({
  key,
  operation,
  retries = 0,
  retryBaseDelayMs = 100,
  retryBackoffMultiplier = 2,
  shouldRetry = () => false,
  maxConcurrency = 0,
  failureThreshold = 0,
  cooldownMs = 0,
}) => {
  if (!key) {
    throw new Error("Resilient operation key is required");
  }

  const hasCircuitGuard =
    Number.isFinite(failureThreshold) &&
    failureThreshold > 0 &&
    Number.isFinite(cooldownMs) &&
    cooldownMs > 0;

  return runWithConcurrencyLimit(key, maxConcurrency, async () => {
    if (hasCircuitGuard) {
      const state = getCircuitState(key);
      const nowMs = Date.now();
      if (nowMs < state.openUntilMs) {
        throw buildCircuitOpenError(Math.max(0, state.openUntilMs - nowMs));
      }
    }

    try {
      const result = await runWithRetry(operation, {
        retries,
        baseDelayMs: retryBaseDelayMs,
        backoffMultiplier: retryBackoffMultiplier,
        shouldRetry,
      });

      if (hasCircuitGuard) {
        const state = getCircuitState(key);
        state.consecutiveFailures = 0;
        state.openUntilMs = 0;
      }

      return result;
    } catch (error) {
      if (hasCircuitGuard && shouldRetry(error)) {
        const state = getCircuitState(key);
        state.consecutiveFailures += 1;

        if (state.consecutiveFailures >= failureThreshold) {
          state.openUntilMs = Date.now() + cooldownMs;
          state.consecutiveFailures = 0;
        }
      }

      throw error;
    }
  });
};

module.exports = {
  getPositiveIntFromEnv,
  runWithRetry,
  runWithConcurrencyLimit,
  runResilientOperation,
  isRetryableHttpError,
};
