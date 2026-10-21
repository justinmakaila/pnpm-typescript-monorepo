# Contributing and extending the workspace

Start at [the README](../README.md) and read [the ownership rules](architecture.md).
Use the closest owning package or app for code and tests. Do not create a new package
merely to have another directory.

## Adding a reusable package

1. Create `packages/<name>/package.json` with a unique scoped `name`, `private: true`,
   `type: module`, real `build/lint/typecheck/test` scripts and explicit `exports` for
   `./dist/*.js` and corresponding `./dist/*.d.ts`.
2. Create a project `tsconfig.json` extending `../../tsconfig.base.json`, with
   `rootDir: src`, `outDir: dist`, and an environment-appropriate `lib`/`types`.
3. Export from `src/index.ts`. Add a package test exercising its **public export**.
4. Add `"@<scope>/<name>": "workspace:*"` to the consuming app/package manifest.
   Import `@<scope>/<name>` rather than navigating to its `src` directory.
5. `pnpm install` (update the committed lockfile), `pnpm verify`. A new `packages/*`
   manifest requires **no edit** to root scripts or the workspace boundary inventory.

## Adding an application

1. Create `apps/<name>/package.json` (private ESM, meaningful package scripts),
   `tsconfig.json`, source entry point and a runnable smoke test.
2. Choose framework/runtime and _then_ add only the appropriate compiler and lint
   overrides. React, Vite, Next.js, Hono and database SDKs are not implicit defaults.
3. Declare reusable library dependencies using `workspace:*`. An app must not import
   another app's private implementation. Integration happens through a defined API
   or an extracted package when necessary.
4. Use `pnpm --filter <package-name> build`, `test`, or `typecheck` for focused runs;
   finish with `pnpm verify` and commit the lockfile.

## Reviews and verification

Run the smallest relevant checks while iterating. For code changing shared exports,
run the consuming app's build/tests. For dependency/topology changes, run
`pnpm check:workspace` and `pnpm test:policy`. For a PR, run `pnpm verify` and report
commands actually executed, failures and environmental limitations. CI performs the
same verification after a frozen install. Keep CI service-independent: service-based
integration tests belong in additional opt-in workflows with explicit ownership.

## Documentation

Update the authoritative guide when changing a contract. Architectural changes
belong in `docs/architecture.md` (or a focused decision note); implementation plans
are not proof of shipped behavior. When adding generated sources, document the owner,
regeneration command and a drift check, rather than editing generated output manually.
