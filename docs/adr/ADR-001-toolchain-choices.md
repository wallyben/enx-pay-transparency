# ADR-001 — Toolchain Choices for the Monorepo Foundation

**Status:** Accepted
**Slice:** S01_foundation_repo_bootstrap
**Date:** 2026-04-05

---

## Context

S01 establishes the monorepo foundation. Every technology choice made here becomes the baseline pattern for all 34 subsequent slices. The choices must support:

- A strict TypeScript-first codebase across apps and packages
- Deterministic, reproducible builds (required by the platform's compliance mandate)
- A lint and typecheck gate that runs in CI before any output is accepted
- A test harness that packages can extend as they add logic in later waves
- A local development environment that does not require external services during Wave 0

These choices require an ADR under PROJECT_PLAN.md section 11 (technology selection, establishes patterns other slices follow).

---

## Decisions

### Package manager: pnpm 10

**Decision:** pnpm 10 with a `pnpm-workspace.yaml` workspace definition.

**Rationale:**
- Strict dependency isolation by default — packages cannot accidentally access undeclared dependencies
- Workspace protocol (`workspace:*`) for cross-package references in later slices
- Significantly faster installs than npm for monorepos via content-addressable storage
- pnpm 10 is the version installed in the build environment (v10.33.0 confirmed)

**Alternative considered:** npm workspaces — rejected because pnpm's strict isolation catches accidental transitive dependency usage earlier, which is important for a compliance codebase where package boundaries are non-negotiable.

---

### Runtime: Node.js 22 LTS

**Decision:** Node 22 (LTS as of 2026) as the minimum required runtime.

**Rationale:**
- Node 22 is installed in the build environment (v22.22.2 confirmed)
- Native support for ES2022 features targeted by `tsconfig.base.json`
- Long-term support lifecycle covers the project's expected delivery timeline

---

### Language: TypeScript 5.7

**Decision:** TypeScript 5.7 (`^5.7.0`) with strict mode enabled.

**Rationale:**
- Strict mode (`"strict": true`) plus `noUncheckedIndexedAccess` and `noImplicitOverride` provide the strongest compile-time correctness guarantees available
- Compliance outputs require deterministic, provably correct logic — TypeScript's type system is the first line of defence
- `declaration: true` and `declarationMap: true` in `tsconfig.base.json` ensure package-to-package imports are always type-safe in later slices

**Module system decision:** CommonJS (`"module": "CommonJS"`, `"moduleResolution": "node"`). No `"type": "module"` in root `package.json`.

**Rationale for CJS over ESM:**
- ts-jest (the test transform) has significantly better CJS support in Jest 29; ESM support in Jest requires `--experimental-vm-modules` and additional configuration that adds fragility
- All current stable Node.js tooling (ESLint plugins, jest, ts-jest) works reliably with CJS
- The platform has no browser-side bundling requirement in Wave 0 — the module system can be revisited in a future ADR if `apps/web` requires ESM

**Consequence:** Future slices must not use top-level `await` or `import.meta` in shared packages without filing a follow-up ADR.

---

### Linter: ESLint 9 (flat config)

**Decision:** ESLint 9 with the flat config format (`eslint.config.js`, `module.exports = [...]`).

**Rationale:**
- ESLint 9 is the current major version; flat config is the stable default
- `@typescript-eslint/parser` and `@typescript-eslint/eslint-plugin` v8 provide first-class TypeScript support
- Flat config avoids the cascading `.eslintrc` inheritance model, which is harder to reason about in a monorepo

**Rules in S01:** Minimal (`no-unused-vars: error`, `no-explicit-any: warn`). Future slices may add type-aware rules by updating `eslint.config.js` (requires updating the owned files list in `SLICE_QUEUE.md` for that slice).

---

### Test framework: Jest 29 with ts-jest

**Decision:** Jest 29 (`^29.7.0`) with ts-jest (`^29.2.0`) as the TypeScript transform.

**Rationale:**
- Jest 29 is the current stable release with broad ecosystem compatibility
- ts-jest transforms TypeScript directly without a separate compile step, keeping the test loop fast
- `jest.config.base.js` is the shared base that package-level jest configs will extend in S02+
- `passWithNoTests: true` in the base config means the root `pnpm test` succeeds before any tests exist — the test runner resolves the workspace correctly, which is the AC for S01

**Alternative considered:** Vitest — rejected because ts-jest + Jest is more mature for Node-only packages, and Vitest's ESM-first default conflicts with the CJS decision above. This can be revisited after Wave 0 if needed.

---

### Formatter: Prettier 3

**Decision:** Prettier 3 (`^3.4.0`) with settings in `.prettierrc`.

**Rationale:** Single source of formatting truth. Configured for TypeScript style conventions (single quotes, trailing commas, 100-char print width).

---

### Docker dev environment

**Decision:** `docker-compose.dev.yml` uses the pre-built `node:22-alpine` image directly for the dev stub. `Dockerfile.dev` is a minimal custom image base for future use.

**Rationale:** The compose file must pass `docker compose config` from S01 onward. Using a pre-built image for the stub avoids any build-time dependency on the application code state (which is empty shells in S01). Future slices that add application entry points can update the compose file (documented as a cross-slice update when it occurs).

---

## Consequences

1. All packages in the monorepo compile to CommonJS. Future slices that require ESM must file an ADR before changing.
2. All new packages must extend `tsconfig.base.json` and must not override `strict` mode.
3. Jest configs in individual packages must extend `jest.config.base.js` (when added in S02+).
4. ESLint flat config at the repo root covers all `.ts` files. Packages do not maintain separate ESLint configs unless there is a documented reason.
5. The minimum Node version is 22; the minimum pnpm version is 10. These are enforced via `engines` in the root `package.json`.
