/**
 * Sample telemetry session fixtures for local UI testing and schema verification.
 */

const SAMPLE_TELEMETRY_BATCH = [
  {
    taskId: "SWE-801",
    category: "SxS Code Eval",
    status: "completed",
    slaSeconds: 2700,
    elapsedSeconds: 1940,
    preferredModel: "model_a",
    notes: "Verified pytest suite inside Ubuntu WSL2; Model B failed edge-case bounds check."
  },
  {
    taskId: "LOG-304",
    category: "Math Proof Audit",
    status: "completed",
    slaSeconds: 2700,
    elapsedSeconds: 2180,
    preferredModel: "model_b",
    notes: "Validated symbolic derivation and caught division-by-zero fallacy in Model A."
  },
  {
    taskId: "SEC-119",
    category: "AST Patch Review",
    status: "completed",
    slaSeconds: 1800,
    elapsedSeconds: 1120,
    preferredModel: "model_a",
    notes: "Inspected unified Git diff hunk headers and verified zero unsafe eval() calls."
  }
];

function validateTelemetrySchema(record) {
  const required = ["taskId", "category", "status", "elapsedSeconds"];
  const missing = required.filter((k) => !(k in (record || {})));
  return {
    valid: missing.length === 0,
    missingKeys: missing
  };
}

module.exports = {
  SAMPLE_TELEMETRY_BATCH,
  validateTelemetrySchema
};
