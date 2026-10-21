# Customizing a new repository

1. Use GitHub **Use this template** after the source repository is marked as a template.
2. Set your desired Node version deliberately and keep `.nvmrc`, `engines` and CI
   aligned. The pnpm version must agree in `packageManager`, `engines`, and CI.
3. Run `pnpm run template:init --name <name> --scope <scope>` once before adding
   custom packages. This updates the starter's names and imports only.
4. Run `pnpm install` and commit `pnpm-lock.yaml` whenever dependencies change.
   Fresh clones and CI use `pnpm install --frozen-lockfile`.
5. Replace or remove the `greeting` and `hello` examples when they cease to add value;
   keep equivalent smoke coverage for your actual public exports.
6. Configure repository description, visibility, license, CODEOWNERS, branch rules,
   required CI status checks and dependabot ownership as appropriate.

## Optional extensions, chosen per project

| Need                  | Adopt only when necessary                                                                                      |
| --------------------- | -------------------------------------------------------------------------------------------------------------- |
| Browser UI            | Vite/React Router/Next.js in a new app; `Bundler` TS resolution and browser-only ESLint globals                |
| HTTP service          | Node transport framework in an owning app, keeping portable business rules out of handlers                     |
| Database              | Migrations, schema and connection lifetime owned by the persistence boundary; no mandatory ORM                 |
| Runtime contracts     | Zod schemas and inferred types for trust boundaries; generator and drift check if there are external contracts |
| Query caching         | TanStack Query hooks layered on framework-independent async data functions within relevant UI features         |
| Storybook             | Component stories/snapshots in a UI app, only when a component library exists                                  |
| Publishing            | Explicit public package metadata, independent version policy, changelogs and a separate release workflow       |
| Deployment            | Provider-specific settings and secrets in the owning application/infrastructure project                        |
| Git hooks             | Optional lint-staged checks; keep full `verify` as the CI contract                                             |
| Change-impact tooling | Introduce when selective CI demonstrably saves enough work to justify a maintained dependency graph            |

If switching package modules to browser bundling, adjust the **owning project's**
`tsconfig.json` rather than changing every Node package. Public APIs must still use
explicit package exports and workspace dependencies.
