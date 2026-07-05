const {
  createTaskRecord,
  formatDuration,
  evaluateSlaState,
  computeSessionMetrics
} = require("../src/telemetryEngine");

describe("telemetryEngine unit tests", () => {
  test("creates valid default task record", () => {
    const rec = createTaskRecord("SWE-101", "code-eval", 1800);
    expect(rec.taskId).toBe("SWE-101");
    expect(rec.status).toBe("in_progress");
    expect(rec.slaSeconds).toBe(1800);
  });

  test("formats durations accurately", () => {
    expect(formatDuration(65)).toBe("01:05");
    expect(formatDuration(3661)).toBe("01:01:01");
  });

  test("identifies SLA warning and breach states", () => {
    expect(evaluateSlaState({ elapsedSeconds: 500, slaSeconds: 1000 })).toBe("nominal");
    expect(evaluateSlaState({ elapsedSeconds: 850, slaSeconds: 1000 })).toBe("warning");
    expect(evaluateSlaState({ elapsedSeconds: 1200, slaSeconds: 1000 })).toBe("breached");
  });

  test("computes aggregate session metrics", () => {
    const sample = [
      { taskId: "T1", status: "completed", elapsedSeconds: 1200, slaSeconds: 1800 },
      { taskId: "T2", status: "completed", elapsedSeconds: 2000, slaSeconds: 1800 }
    ];
    const m = computeSessionMetrics(sample);
    expect(m.totalTasks).toBe(2);
    expect(m.completedTasks).toBe(2);
    expect(m.slaComplianceRate).toBe(50.0);
  });
});

const { generateMarkdownReport, summarizeByCategory } = require("../src/markdownExporter");
const { filterTasksByCriteria } = require("../src/keyboardShortcuts");

describe("markdownExporter and filtering tests", () => {
  const records = [
    { taskId: "EVAL-10", category: "code-eval", elapsedSeconds: 900, slaSeconds: 1800, status: "completed", notes: "AST verified" },
    { taskId: "MATH-22", category: "math-proof", elapsedSeconds: 1500, slaSeconds: 1800, status: "in_progress", notes: "Induction step" }
  ];

  test("generates formatted markdown table", () => {
    const md = generateMarkdownReport(records, "Audit Batch");
    expect(md).toContain("# Audit Batch");
    expect(md).toContain("| EVAL-10 | code-eval | 15:00 | completed | AST verified |");
  });

  test("filters tasks by category and search query", () => {
    const filtered = filterTasksByCriteria(records, "induction", "math-proof", "ALL");
    expect(filtered.length).toBe(1);
    expect(filtered[0].taskId).toBe("MATH-22");
  });

  test("summarizes counts by category", () => {
    const summary = summarizeByCategory(records);
    expect(summary["code-eval"]).toBe(1);
    expect(summary["math-proof"]).toBe(1);
  });
});
