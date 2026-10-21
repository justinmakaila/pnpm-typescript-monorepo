---
name: pr-verification
description: Use when implementing/reviewing a PR or confirming readiness for merge.
---

# PR verification

**Input:** Branch/PR, scope and acceptance conditions.

1. Inspect the diff against base; classify owners and changed public exports.
2. Review dependency direction, workspace manifests, tests and documentation drift.
3. Execute focused package checks. For shared changes, exercise a real consumer.
4. Execute `pnpm verify` after installing from the committed lockfile.
5. Record actual commands, results, limitations and any follow-up that is independently
   deliverable. Do not claim a check that was not run.

**Output:** Concise evidence-based change summary, failures, and merge blockers.
