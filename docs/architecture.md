# Architecture and authority

```
apps/hello (private Node CLI / composition root)
    └── @workspace/greeting (private reusable package)
          └── public ./dist/index.js and ./dist/index.d.ts exports
```

Applications own entry points, transport, framework setup, deployment and dependency
composition. Reusable packages own actual reusable functionality or stable contracts,
not hypothetical architectural layers. Code that has only one consumer may remain local
until a real second use or independent evolution justifies extraction. Framework-specific
code can live in its owning app.

**Source of truth:** `pnpm-workspace.yaml` selects workspace directories; manifests own
identity, dependencies, scripts, and exported public interfaces; `tsconfig.base.json`
owns common compiler strictness; each project owns its runtime-specific overrides.
`scripts/check-workspace.mjs` discovers manifests (no parallel registry) and verifies
that imports between workspaces use declared `workspace:*` dependencies and explicit
manifest exports; applications cannot import applications. Focused tests exercise
intentionally invalid examples. Import lint checks ordering/resolution; neither
repository scripts nor documentation is a second architecture registry.

## Module and build strategy

- Authored source: TypeScript (`.ts`) and ESM via `"type": "module"`.
- **Node applications/packages:** `module` and `moduleResolution` are `NodeNext`, so
  relative TypeScript imports specify `.js` extensions when compiled to ESM.
- **Browser apps:** choose `Bundler` resolution and an app-specific `noEmit` build
  when adding the actual bundler. Do not inherit a Node-only `lib` or globals blindly.
- Libraries compile to `dist` with `.js` + `.d.ts`, and explicit package exports
  are the only supported consumer import surface.
- pnpm's workspace dependency graph determines build order; project references
  are deliberately unnecessary for this two-workspace starter. Evaluate them once
  incremental multi-package TS builds have measured value.
- `.mjs` is limited to Node-executed lint/tooling/test scripts that must execute
  without a TypeScript bootstrap. No `.cjs` or runtime `require` architecture.
- Generated code, if introduced, needs one identifiable schema/generator owner;
  keep outputs distinct from source and document freshness verification.

A package can expose multiple named subpaths by explicitly extending its `exports`.
Only expose genuinely stable interfaces. Do not consume `packages/other/src` or use
TypeScript path mappings as substitutes for package dependencies.

## Validation pipeline

`pnpm verify` (also CI) checks workspace policy, Prettier, builds, ESLint, TypeScript,
package tests, and policy regressions, in that order. Builds occur before lint/typecheck
because package exports point at compiled `dist` files. Tests are offline, deterministic,
and run without cloud services. `pnpm test` is a post-build command when invoked alone
on a fresh checkout. The demo CLI reads only a command-line argument.

The `@workspace/greeting` package exposes one testable function; the CLI demonstrates
that a runtime consumer resolves the compiled public export correctly. These are
proportional fixtures, not a required service/repository hierarchy.
