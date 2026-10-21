# Agent instructions

Start with the task, inspect the owning `apps/*` or `packages/*` manifest and source,
and then read only the relevant reference in `docs/`. Do not infer shipped behavior
from plans or documentation when source disagrees. Preserve unrelated edits.

## Ownership

- `apps/*` own runtime composition, entry points, framework and deployment choices.
- `packages/*` own independently useful capabilities or stable contracts.
- Declare `workspace:*` dependencies and import only named manifest exports. Never
  import another app's private source or use `../` to cross workspace boundaries.
- Don't introduce a service/repository abstraction without a concrete purpose.
- Add environment-specific TS/ESLint blocks only with an actual runtime owner.

## Authority and navigation

- Workspace membership: `pnpm-workspace.yaml`; identity/exports/scripts: manifests.
- Enforcement: `scripts/check-workspace.mjs` and its mutation tests.
- TypeScript defaults: `tsconfig.base.json`, project-specific overrides beside owners.
- Shared lint policy: `eslint.config.mjs`; formatting: `prettier.config.mjs`.
- Architecture: `docs/architecture.md`; adding owners: `docs/contributing.md`.
- Decisions/exclusions: `docs/adoption-matrix.md`.
- Skills: `.agents/skills/` for bounded recurring procedures; avoid duplicating this file.

## Work and verify

Use `pnpm --filter <workspace> <command>` while iterating. `pnpm build` is required
before `pnpm lint` / `pnpm typecheck` / `pnpm test` on a clean checkout because
exports target compiled `dist`. Finish changes with `pnpm verify`, the same contract
used by CI. Report exactly which checks ran, which failed, and any missing environment,
permissions or external services; never claim a skipped command passed.

Generated outputs are never the authority: identify an owning schema, generator and
freshness check before introducing them. Keep source documentation short, update it
when behavior changes, and avoid unneeded agent-specific instruction copies.
