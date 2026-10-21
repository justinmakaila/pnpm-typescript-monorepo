---
name: add-workspace
description: Use when adding a new application or reusable package to the pnpm workspace.
---

# Add a workspace

**Input:** Proposed name, kind (`apps` or `packages`), runtime, and concrete consumers.

1. Verify that this deserves a separate workspace rather than a local feature.
2. Follow `docs/contributing.md`; create a manifest, scoped TypeScript config,
   meaningful `build`, `lint`, `typecheck`, and `test` commands.
3. For libraries, expose compiled `dist` through explicit `exports`, and write a
   public-consumer test. For apps, own composition and entry points.
4. Declare `workspace:*` consumers and verify no cross-app or private-source imports.
5. Run `pnpm install`, focused checks, then `pnpm verify`; commit lockfile changes.

**Output:** Files changed, documented public API, tested consumer, and exact checks.
Use `scripts/check-workspace.mjs` rather than maintaining a parallel package registry.
