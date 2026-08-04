class BackgroundJobQueue {
  constructor(options) {
    const { concurrency, getJobKey, runJob, onDuplicate, onSuccess, onError } =
      options;

    this.concurrency = Number.isFinite(concurrency)
      ? Math.max(1, concurrency)
      : 1;
    this.getJobKey = getJobKey;
    this.runJob = runJob;
    this.onDuplicate = onDuplicate;
    this.onSuccess = onSuccess;
    this.onError = onError;

    this.pendingJobs = [];
    this.activeJobs = 0;
    this.queuedOrRunningJobKeys = new Set();
  }

  enqueue(job) {
    const jobKey = this.getJobKey(job);
    if (this.queuedOrRunningJobKeys.has(jobKey)) {
      if (this.onDuplicate) {
        this.onDuplicate(job, jobKey);
      }
      return false;
    }

    this.queuedOrRunningJobKeys.add(jobKey);
    this.pendingJobs.push({ ...job, jobKey });
    this.drain();
    return true;
  }

  enqueueMany(jobs) {
    for (const job of jobs) {
      this.enqueue(job);
    }
  }

  drain() {
    while (this.activeJobs < this.concurrency && this.pendingJobs.length > 0) {
      const job = this.pendingJobs.shift();
      if (!job) {
        return;
      }

      this.activeJobs += 1;
      Promise.resolve(this.runJob(job))
        .then(() => {
          if (this.onSuccess) {
            this.onSuccess(job);
          }
        })
        .catch((error) => {
          if (this.onError) {
            this.onError(job, error);
          }
        })
        .finally(() => {
          this.activeJobs -= 1;
          this.queuedOrRunningJobKeys.delete(job.jobKey);
          this.drain();
        });
    }
  }
}

module.exports = { BackgroundJobQueue };
