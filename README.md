# flowstate-telemetry

A real-time workflow and evaluation task telemetry tracker built with **React**, **Tailwind CSS**, and **Firebase Firestore**. Designed for high-focus technical evaluation pipelines to monitor task SLA timers, log side-by-side (SxS) defect notes, and export structured Markdown or JSONL session reports.

## Key Features
- **Sub-Second State Synchronization:** Persists active task timers and session logs via Firebase Firestore (`src/firebaseSync.js`) with an automatic offline `localStorage` reconciliation queue.
- **Standalone Single-File Dashboard (`index.html`):** Zero-build-step dark-mode interface powered by React 18 and Tailwind CSS that runs directly in any modern browser.
- **SLA Breach & Throughput Telemetry (`src/telemetryEngine.js`):** Tracks elapsed task time against configurable SLA windows (nominal, warning, breached) and computes hourly task throughput.
- **One-Click Markdown & JSONL Export (`src/markdownExporter.js`):** Generates formatted Markdown summary tables and raw JSONL batches for daily QA reporting.
- **Keyboard-First Navigation (`src/keyboardShortcuts.js`):** Supports rapid task switching and multi-criteria filtering across coding, math proof, and patch review queues.

## Project Structure
- `index.html`: Standalone single-file React + Tailwind CSS web application.
- `src/telemetryEngine.js`: Core duration formatting, SLA compliance, and throughput calculation logic.
- `src/firebaseSync.js`: Firestore real-time document adapter with offline queue flushing.
- `src/markdownExporter.js`: Markdown table and JSONL batch report generator.
- `src/keyboardShortcuts.js`: Hotkey binding resolver and search/category filter engine.
- `src/sampleFixtures.js`: Reference evaluation session records and schema validation helpers.
- `tests/telemetry.test.js`: Jest unit test suite covering SLA calculations, filtering, and Markdown exports.

## Quick Start

```bash
# Launch the standalone dashboard locally on port 8080
python3 -m http.server 8080

# Run the Jest unit test suite
npm test
```
