/**
 * Keyboard shortcut dispatcher and category filter utilities for rapid UI navigation.
 */

const DEFAULT_BINDINGS = {
  "Alt+N": "FOCUS_NEW_TASK",
  "Alt+S": "TOGGLE_ACTIVE_TIMER",
  "Alt+E": "EXPORT_MARKDOWN",
  "Alt+C": "COMPLETE_ACTIVE_TASK"
};

function resolveShortcutAction(event, bindings = DEFAULT_BINDINGS) {
  if (!event || !event.key) return null;
  const parts = [];
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");
  parts.push(String(event.key).toUpperCase());
  const combo = parts.join("+");
  return bindings[combo] || null;
}

function filterTasksByCriteria(tasks, query = "", category = "ALL", status = "ALL") {
  const q = String(query || "").trim().toLowerCase();
  return (tasks || []).filter((t) => {
    const matchesCategory = category === "ALL" || t.category === category;
    const matchesStatus = status === "ALL" || t.status === status;
    const matchesQuery =
      !q ||
      String(t.taskId).toLowerCase().includes(q) ||
      String(t.notes || "").toLowerCase().includes(q);
    return matchesCategory && matchesStatus && matchesQuery;
  });
}

module.exports = {
  DEFAULT_BINDINGS,
  resolveShortcutAction,
  filterTasksByCriteria
};
