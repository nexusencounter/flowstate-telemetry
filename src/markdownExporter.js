/**
 * Structured Markdown and JSONL export generator for completed telemetry sessions.
 */

const { formatDuration, computeSessionMetrics } = require("./telemetryEngine");

function generateMarkdownReport(tasks, sessionTitle = "Daily Evaluation Telemetry") {
  const metrics = computeSessionMetrics(tasks);
  const lines = [
    "# " + sessionTitle,
    "",
    "## Session Summary",
    "- **Total Tasks:** " + metrics.totalTasks,
    "- **Completed Tasks:** " + metrics.completedTasks,
    "- **Total Active Time:** " + formatDuration(metrics.totalSeconds),
    "- **SLA Compliance Rate:** " + metrics.slaComplianceRate + "%",
    "",
    "## Task Breakdown",
    "| Task ID | Category | Duration | Status | Notes |",
    "| :--- | :--- | :--- | :--- | :--- |"
  ];

  for (const t of tasks) {
    const safeNotes = (t.notes || "-").replace(/\|/g, "/");
    lines.push(
      "| " + t.taskId + " | " + t.category + " | " + formatDuration(t.elapsedSeconds) + " | " + t.status + " | " + safeNotes + " |"
    );
  }

  return lines.join("\n");
}

function generateJsonlBatch(tasks) {
  return tasks.map((t) => JSON.stringify(t)).join("\n");
}

module.exports = {
  generateMarkdownReport,
  generateJsonlBatch
};

function summarizeByCategory(tasks) {
  const counts = {};
  for (const t of tasks || []) {
    const cat = t.category || "uncategorized";
    counts[cat] = (counts[cat] || 0) + 1;
  }
  return counts;
}

module.exports.summarizeByCategory = summarizeByCategory;
