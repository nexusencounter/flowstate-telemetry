/**
 * Core Telemetry Engine for tracking evaluation task durations, SLA thresholds,
 * and session throughput metrics.
 */

const DEFAULT_SLA_SECONDS = 2700; // 45 minutes per complex evaluation task

function createTaskRecord(taskId, category, slaSeconds = DEFAULT_SLA_SECONDS) {
  if (!taskId || typeof taskId !== "string") {
    throw new Error("Valid string taskId is required");
  }
  return {
    taskId: taskId.trim(),
    category: category || "code-eval",
    status: "in_progress",
    slaSeconds: Number(slaSeconds) || DEFAULT_SLA_SECONDS,
    elapsedSeconds: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
    preferredModel: null,
    notes: ""
  };
}

function formatDuration(totalSeconds) {
  const clamped = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(clamped / 3600);
  const mins = Math.floor((clamped % 3600) / 60);
  const secs = clamped % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hrs > 0 ? pad(hrs) + ":" + pad(mins) + ":" + pad(secs) : pad(mins) + ":" + pad(secs);
}

function evaluateSlaState(task) {
  const ratio = task.elapsedSeconds / (task.slaSeconds || DEFAULT_SLA_SECONDS);
  if (ratio >= 1.0) return "breached";
  if (ratio >= 0.8) return "warning";
  return "nominal";
}

function computeSessionMetrics(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      totalSeconds: 0,
      averageSecondsPerTask: 0,
      slaComplianceRate: 100.0
    };
  }

  const completed = tasks.filter((t) => t.status === "completed");
  const totalSeconds = tasks.reduce((acc, t) => acc + (Number(t.elapsedSeconds) || 0), 0);
  const compliantCount = completed.filter((t) => t.elapsedSeconds <= t.slaSeconds).length;
  const complianceRate = completed.length > 0 ? (compliantCount / completed.length) * 100 : 100.0;

  return {
    totalTasks: tasks.length,
    completedTasks: completed.length,
    totalSeconds: totalSeconds,
    averageSecondsPerTask: completed.length > 0 ? Math.round(totalSeconds / completed.length) : 0,
    slaComplianceRate: Number(complianceRate.toFixed(1))
  };
}

module.exports = {
  DEFAULT_SLA_SECONDS,
  createTaskRecord,
  formatDuration,
  evaluateSlaState,
  computeSessionMetrics
};

function calculateThroughputPerHour(tasks) {
  const metrics = computeSessionMetrics(tasks);
  if (metrics.totalSeconds <= 0 || metrics.completedTasks <= 0) return 0.0;
  const hours = metrics.totalSeconds / 3600;
  return Number((metrics.completedTasks / hours).toFixed(2));
}

module.exports.calculateThroughputPerHour = calculateThroughputPerHour;
