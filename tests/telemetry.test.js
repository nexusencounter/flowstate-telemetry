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
