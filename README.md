# TypeScript pnpm monorepo template

A deliberately small, framework-neutral starting point for TypeScript applications,
services, CLIs, and libraries. It has one executable Node application and one compiled
library to demonstrate the actual workspace contract, not a sample product.

## Included

- pnpm workspace with explicit `workspace:*` dependencies and public package exports.
- Strict TypeScript, ESM and `NodeNext` for the **Node examples**; no mandatory browser framework.
- One ESLint flat config (typescript-eslint + import ordering), Prettier, package-scoped lint.
- Workspace boundary validator with regression fixtures, compiled tests using `node:test`.
- One credential-free CI verification entrypoint and minimum-privilege workflow.
- Root agent guidance and four task-specific skills.

## Requirements and first run

- Node **22.16.0** (`.nvmrc`); use `nvm use` or another version manager.
- pnpm **10.17.1** (`packageManager`; `corepack enable` makes the pinned CLI available).
- Internet access for the _initial installation only_. Verification needs no services or secrets.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm verify
pnpm --filter @workspace/hello start monorepo
```

**Dependency policy:** The committed `pnpm-lock.yaml` is the authority for reproducible installs. Use `pnpm install --frozen-lockfile` for a fresh checkout; after intentionally changing dependencies or initializing a new project namespace, run `pnpm install` and commit the updated lockfile.

When you create a new repository from the template, initialize its names:

```sh
pnpm run template:init --name my-project --scope my-team
pnpm install
pnpm verify
```

The initializer changes only the initial package manifests, CLI import, test import,
and root convenience script. It is safe to rerun with the same arguments. Add new workspaces
using [the contributor guide](docs/contributing.md), not by rerunning initialization after
customizing those new packages.

## Commands

| Command                             | Purpose                                                                 |
| ----------------------------------- | ----------------------------------------------------------------------- |
| `pnpm dev`                          | Build the shared library, then watch the sample CLI's TypeScript source |
| `pnpm build`                        | Build dependency-sorted workspace projects                              |
| `pnpm lint` / `pnpm lint:fix`       | Check / fix root and package-owned source                               |
| `pnpm format` / `pnpm format:check` | Write / check Prettier formatting                                       |
| `pnpm typecheck`                    | Run package-specific TypeScript checks (build first on clean trees)     |
| `pnpm test`                         | Run package tests against built public exports                          |
| `pnpm test:policy`                  | Exercise custom workspace and lint policies                             |
| `pnpm check:workspace`              | Check exports, dependencies, and cross-workspace imports                |
| `pnpm verify`                       | Run all of the above in canonical order (CI contract)                   |

For targeted commands, use `pnpm --filter @workspace/greeting build`,
`pnpm --filter @workspace/hello test`, or run `pnpm lint` inside a package directory.
The root uses package scripts rather than hardcoding every app's test runner.

## Navigate

- [Architecture and package boundaries](docs/architecture.md)
- [Adding an app/package and focused checks](docs/contributing.md)
- [Template customization and optional extensions](docs/customization.md)
- [Adoption decision matrix and tradeoffs](docs/adoption-matrix.md)
- [Agent instructions](AGENTS.md)

### Not included

No React/Next.js, HTTP framework, ORM, database, cloud provider, schema generator,
submodule, release train, release credentials, or mandatory git hook. Opt in when
building a project that requires one. The `apps/hello` CLI is a boundary smoke test,
not a recommended application framework.
