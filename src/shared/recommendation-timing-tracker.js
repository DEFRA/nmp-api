let sequence = 0;

const state = {
  active: 0,
  completed: 0,
  failed: 0,
  cumulativeDurationMs: 0,
};

const nowNs = () => process.hrtime.bigint();

const toSeconds = (ms) => (ms / 1000).toFixed(3);

const normalizeSource = (source) => {
  if (typeof source !== "string" || source.trim() === "") {
    return "foreground";
  }

  return source.trim();
};

const start = ({ fieldID, year, source, isBackground }) => {
  sequence += 1;
  state.active += 1;

  return {
    runId: sequence,
    fieldID,
    year,
    source: normalizeSource(source),
    isBackground: Boolean(isBackground),
    startedAtNs: nowNs(),
  };
};

const finish = (run, status = "completed") => {
  const elapsedNs = nowNs() - run.startedAtNs;
  const elapsedMs = Number(elapsedNs) / 1e6;

  state.active = Math.max(0, state.active - 1);

  if (status === "completed") {
    state.completed += 1;
    state.cumulativeDurationMs += elapsedMs;
  } else {
    state.failed += 1;
  }

  const summary = {
    runId: run.runId,
    fieldID: run.fieldID,
    year: run.year,
    source: run.source,
    isBackground: run.isBackground,
    status,
    durationSeconds: toSeconds(elapsedMs),
    cumulativeCompleted: state.completed,
    cumulativeSeconds: toSeconds(state.cumulativeDurationMs),
    active: state.active,
    failed: state.failed,
  };

  const logLevel = status === "completed" ? console.log : console.error;
  logLevel("[RecommendationTiming]", JSON.stringify(summary));

  return summary;
};

const recommendationTimingTracker = {
  start,
  finish,
};

module.exports = {
  recommendationTimingTracker,
};
