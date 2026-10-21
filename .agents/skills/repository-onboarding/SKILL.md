---
name: repository-onboarding
description: Use when entering this repo for a new task or diagnosing unfamiliar ownership.
---

# Repository onboarding

**Input:** Task statement, affected entry point or behavior.

1. Read root `AGENTS.md`; inspect root scripts and `pnpm-workspace.yaml`.
2. Trace the owning manifest and exported entry point; read only the appropriate
   architecture or contributor reference.
3. Follow actual imports to callers/tests; distinguish app composition from packages.
4. Report current authority, likely edit paths, the smallest focused validation,
   and open questions that genuinely block work.

**Output:** Short ownership map and executable checks. Do not install a new framework,
write broad architecture proposals, or load unrelated documentation by default.
