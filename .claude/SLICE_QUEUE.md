# SLICE_QUEUE.md
# Euronext Pay Transparency Control Tower
# Live Operational Slice Queue — v1.0

---

## CURRENT ACTIVE SLICE

**Slice ID:** S12  
**Name:** reporting_pack_base  
**Status:** PENDING — **S11 ACCEPTED** (2026-04-07). Next implementation slice; **not started**.  
**Wave:** 3 — Metrics and reporting core  
**Milestone:** M3

**Integration branch:** `claude/setup-repo-structure-dGb6o` — PR [#3](https://github.com/wallyben/enx-pay-transparency/pull/3) merged 2026-04-06; S04 ACCEPTED below; full validation (`pnpm test`, `pnpm typecheck`, `pnpm lint`) passed on integration after merge.

---

## GO / NO-GO MILESTONE CHECKPOINTS

| Milestone | Trigger | Required Before Advancing |
|---|---|---|
| M0 Gate | S01–S04 all ACCEPTED | All tests pass in CI; ADRs for tech choices filed — **passed / closed 2026-04-06** |
| M1 Gate | S05–S07 all ACCEPTED | Snapshot lineage verified end-to-end; no unmapped workers in test fixtures |
| M2 Gate | S08–S10 all ACCEPTED | Classification engine produces deterministic output; all override paths tested |
| M3 Gate | S11–S13 all ACCEPTED | EU core metrics verified against known test cases; evidence pack reviewable |
| M4 Gate | S14–S17 all ACCEPTED | Casework workflow complete; remediation register functional |
| M5 Gate | S18–S19 all ACCEPTED | Policy registry operational; recruiting controls tested |
| M6 Gate | S20–S31 all ACCEPTED | All 12 country packs accepted; each tested with country-specific fixtures |
| M7 Gate | S32–S35 all ACCEPTED | Security review passed; runbooks complete; release-ready |

---

## WAVE 0 — FOUNDATION

**Milestone M0 — Foundation:** **CLOSED** (2026-04-06). S01–S04 ACCEPTED; PR #3 merged to `claude/setup-repo-structure-dGb6o`; ADR-001–ADR-004 filed; `pnpm test` / `pnpm typecheck` / `pnpm lint` passed on integration.

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S01 | foundation_repo_bootstrap | ACCEPTED | 2026-04-05 | All 11 AC met. pnpm/lint/typecheck/test all pass. ADR-001 filed. |
| S02 | core_contracts_and_enums | ACCEPTED | 2026-04-05 | All 7 AC met. 47 tests pass. ADR-002 filed. S03 unblocked. |
| S03 | canonical_worker_and_pay_models | ACCEPTED | 2026-04-06 | Landed via PR #2; canonical model, migration, tests; ADR-003 `docs/adr/ADR-003-canonical-model-structure.md` |
| S04 | audit_and_security_baseline | ACCEPTED | 2026-04-06 | Landed via PR #3; audit + security packages, tests; ADR-004 `docs/adr/ADR-004-audit-security-baseline-structure.md` |

### S01 — foundation_repo_bootstrap

**Purpose:** Establish the monorepo workspace configuration, root tooling baseline, CI pipeline skeleton, and Docker dev environment stub. Create minimal structural shells for the app and package directories that Wave 0 slices will build into. No business logic, no domain types, no feature code, no database schema. The shells exist only to give the repo its correct shape and to allow the workspace, TypeScript project references, and CI to resolve all packages from the first commit.

**Owned Files:**

Root tooling:
- `package.json` (root workspace config with scripts: install, lint, test, build)
- `pnpm-workspace.yaml`
- `tsconfig.base.json`
- `eslint.config.js`
- `.prettierrc`
- `jest.config.base.js`
- `.gitignore`
- `.editorconfig`
- `.env.example`
- `README.md` (minimal: project name, setup instructions, link to SLICE_QUEUE.md)

Infrastructure:
- `infra/docker/Dockerfile.dev`
- `infra/docker/docker-compose.dev.yml`

CI:
- `.github/workflows/ci.yml`

App shells — each contains only `package.json`, `tsconfig.json`, `src/index.ts` (empty export):
- `apps/api/package.json`
- `apps/api/tsconfig.json`
- `apps/api/src/index.ts`
- `apps/web/package.json`
- `apps/web/tsconfig.json`
- `apps/web/src/index.ts`
- `apps/worker/package.json`
- `apps/worker/tsconfig.json`
- `apps/worker/src/index.ts`

Package shells — each contains only `package.json`, `tsconfig.json`, `src/index.ts` (empty export):
- `packages/contracts/package.json`
- `packages/contracts/tsconfig.json`
- `packages/contracts/src/index.ts`
- `packages/canonical-model/package.json`
- `packages/canonical-model/tsconfig.json`
- `packages/canonical-model/src/index.ts`
- `packages/audit/package.json`
- `packages/audit/tsconfig.json`
- `packages/audit/src/index.ts`
- `packages/security/package.json`
- `packages/security/tsconfig.json`
- `packages/security/src/index.ts`
- `packages/test-fixtures/package.json`
- `packages/test-fixtures/tsconfig.json`
- `packages/test-fixtures/src/index.ts`

**Acceptance Criteria:**
- [ ] `pnpm install` completes without errors from the repo root
- [ ] `pnpm lint` runs and exits cleanly across all packages in the workspace (no errors, no warnings treated as errors)
- [ ] `pnpm test` runs and exits cleanly — zero tests, zero failures (no tests exist yet; this verifies the test runner resolves the workspace correctly)
- [ ] `pnpm build` (or `pnpm typecheck`) runs on all packages and apps with zero TypeScript errors
- [ ] `docker compose -f infra/docker/docker-compose.dev.yml up` starts without errors
- [ ] `.github/workflows/ci.yml` is syntactically valid YAML; references the correct lint, test, and build commands
- [ ] All 5 package shells exist and are listed in pnpm workspace: `contracts`, `canonical-model`, `audit`, `security`, `test-fixtures`
- [ ] All 3 app shells exist and are listed in pnpm workspace: `api`, `web`, `worker`
- [ ] Every `tsconfig.json` in apps and packages extends `tsconfig.base.json`
- [ ] No shell contains any business logic, domain types, Zod schemas, database references, or feature code
- [ ] `src/index.ts` in every shell is an empty export (`export {};`) — no implementation

**Tests:** No unit tests required for this slice. Rationale: all owned files are configuration, manifests, and empty shells containing no executable logic. Evidence of delivery is the passing output of `pnpm install`, `pnpm lint`, `pnpm build`, and `pnpm test` from CI.

**Blockers / Review Notes:**
- Scope correction applied 2026-04-05: S01 now includes structural package and app shells. Downstream slices S02 (contracts), S03 (canonical-model), S04 (audit + security) will be populating existing shells, not creating new packages. Their owned files lists remain correct but their "new package" language should be read as "implementing the content of the existing shell."

**Completion record — 2026-04-05:**
- Status set to ACCEPTED
- ADR-001 filed: `docs/adr/ADR-001-toolchain-choices.md` (toolchain selections: pnpm 10, Node 22, TypeScript 5.7, ESLint 9 flat config, Jest 29 + ts-jest, Prettier 3, CommonJS module system)
- `pnpm install` — PASS (9 workspace projects, 355 packages)
- `pnpm lint` — PASS (0 errors, 0 warnings)
- `pnpm typecheck` — PASS (all 8 packages, 0 TS errors)
- `pnpm test` — PASS (0 tests, 0 failures, exit 0 via passWithNoTests)
- `docker compose -f infra/docker/docker-compose.dev.yml config` — PASS (valid YAML, resolved correctly)
- All 8 tsconfig.json files extend `../../tsconfig.base.json` — PASS
- All 8 `src/index.ts` files contain only `export {};` — PASS
- All 5 package shells discoverable in workspace — PASS
- All 3 app shells discoverable in workspace — PASS
- No business logic, domain types, or feature code in any shell — PASS
- No country-specific logic in any file — PASS
- No files created outside owned scope (ADR in docs/adr/ is permitted at any time per CLAUDE.md) — PASS

---

### S02 — core_contracts_and_enums

**Purpose:** Define all shared TypeScript types, enums, and Zod validation schemas that the rest of the platform depends on. No implementation logic — contracts only.

**Owned Files:**
- `packages/contracts/` (new package, all files)
- `packages/contracts/src/enums/` (WorkerStatus, EmploymentType, ContractType, Gender, PayComponent, SnapshotStatus, CaseworkStatus, RemediationStatus, ReviewStatus, etc.)
- `packages/contracts/src/types/` (shared interface stubs for canonical model, intake, metrics, casework, remediation)
- `packages/contracts/src/schemas/` (Zod schemas for all enums and base types)
- `packages/contracts/src/index.ts`
- `packages/contracts/package.json`
- `packages/contracts/tsconfig.json`
- `packages/contracts/jest.config.js`
- `packages/contracts/src/__tests__/`

**Acceptance Criteria:**
- [x] All enums are defined and exported
- [x] All base type interfaces are defined and exported
- [x] All Zod schemas match their corresponding TypeScript types
- [x] Unit tests verify enum values and schema validation
- [x] No country-specific values in any enum or type
- [x] Package compiles with zero TypeScript errors
- [x] Package is importable from other packages in the workspace

**Blockers / Review Notes:**
- Blocked on S01 (workspace must be configured)
- Note: `packages/contracts/` shell (package.json, tsconfig.json, src/index.ts) is created in S01. This slice populates the src/ content — it does not create a new package from scratch.

**Completion record — 2026-04-05:**
- Status set to ACCEPTED
- ADR-002 filed: `docs/adr/ADR-002-zod-as-validation-library.md` (Zod v3 chosen as runtime validation library)
- Enums created: WorkerStatus, EmploymentType, ContractType, Gender, PayComponent, SnapshotStatus, CaseworkStatus, RemediationStatus, ReviewStatus, CountryCode (10 enums)
- Types created: Result<T,E> with ok()/fail() helpers, ApiError, PaginationQuery, PaginatedResult<T>
- Zod schemas created: one per enum (nativeEnum), ApiErrorSchema, PaginationQuerySchema
- `pnpm --filter @enx/contracts run test` — PASS (47 tests, 3 suites, 0 failures)
- `pnpm --filter @enx/contracts run typecheck` — PASS (0 TS errors)
- `pnpm lint` — PASS (0 errors, 0 warnings)
- `pnpm typecheck` (all packages) — PASS (0 errors across 8 packages)
- No country-specific logic introduced — PASS (CountryCode uses ISO 3166-1 codes only)
- No files outside owned scope modified (ADR in docs/adr/ is permitted at any time) — PASS
- S03 unblocked

---

### S03 — canonical_worker_and_pay_models

**Purpose:** Define the canonical data models for workers, jobs, pay records, and periods. These are the normalized internal representations that all upstream sources map into. These models are country-agnostic.

**Owned Files:**
- `packages/canonical-model/` (new package, all files)
- `packages/canonical-model/src/worker.ts`
- `packages/canonical-model/src/job.ts`
- `packages/canonical-model/src/pay-record.ts`
- `packages/canonical-model/src/period.ts`
- `packages/canonical-model/src/snapshot.ts`
- `packages/canonical-model/src/index.ts`
- `packages/canonical-model/package.json`
- `packages/canonical-model/tsconfig.json`
- `packages/canonical-model/src/__tests__/`

**Acceptance Criteria:**
- [ ] Canonical worker model captures all required fields (worker ID, employment type, contract type, gender, FTE fraction, hire date, seniority, cost center, location, job reference)
- [ ] Canonical pay record captures all required components (base pay, variable pay, bonuses, benefits — as typed, labeled components)
- [ ] Canonical snapshot model captures snapshot ID, period, methodology version, rule pack version, creation timestamp, creator, and status
- [ ] All models extend or import from `packages/contracts/`
- [ ] No country-specific fields in any canonical model
- [ ] Unit tests cover model construction and validation
- [ ] Package compiles with zero TypeScript errors

**Blockers / Review Notes:**
- Blocked on S02 (contracts must be defined)
- Note: `packages/canonical-model/` shell (package.json, tsconfig.json, src/index.ts) is created in S01. This slice populates the src/ content.

---

### S04 — audit_and_security_baseline

**Purpose:** Implement the audit log write path, audit query interface, PII field tagging, and baseline encryption utilities. Every downstream package that writes auditable events will depend on this.

**Owned Files:**
- `packages/audit/` (new package, all files)
- `packages/audit/src/writer.ts`
- `packages/audit/src/query.ts`
- `packages/audit/src/types.ts`
- `packages/audit/src/index.ts`
- `packages/security/` (new package, all files)
- `packages/security/src/pii.ts` (PII field tagging and masking utilities)
- `packages/security/src/encryption.ts` (field-level encryption stubs)
- `packages/security/src/index.ts`
- `packages/audit/package.json`, `tsconfig.json`, `jest.config.js`
- `packages/security/package.json`, `tsconfig.json`, `jest.config.js`
- `packages/audit/src/__tests__/`
- `packages/security/src/__tests__/`

**Acceptance Criteria:**
- [ ] Audit writer accepts an event and persists it with: actor, action, target entity, timestamp, metadata
- [ ] Audit query interface can retrieve events by actor, by entity, and by time range
- [ ] PII tagging utility can mark fields as PII and produce a masked representation
- [ ] Encryption utility provides encrypt/decrypt for string fields (key management stubbed for now)
- [ ] Unit tests cover audit write, query, PII masking, and encrypt/decrypt round trip
- [ ] No country-specific logic
- [ ] Both packages compile with zero TypeScript errors

**Blockers / Review Notes:**
- Blocked on S03 (canonical model required for audit event targeting)
- Note: `packages/audit/` and `packages/security/` shells (package.json, tsconfig.json, src/index.ts) are created in S01. This slice populates the src/ content in both.

**Completion record — 2026-04-06:**
- Status set to ACCEPTED (on integration `claude/setup-repo-structure-dGb6o` after merge of PR #3)
- ADR-004 filed: `docs/adr/ADR-004-audit-security-baseline-structure.md`
- `pnpm test` — PASS (21 suites, 246 tests, 0 failures)
- `pnpm typecheck` — PASS (8 workspace projects)
- `pnpm lint` — PASS
- M0 gate cleared; S05 unblocked as next slice (PENDING, not started)

---

## WAVE 1 — INTAKE AND SNAPSHOT CONTROL

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S05 | intake_upload_and_validation | ACCEPTED | 2026-04-06 | Intake HTTP path, `@enx/intake-engine`, contracts, audit + tests; ADR-005 |
| S06 | mapping_and_normalization_pipeline | ACCEPTED | 2026-04-06 | Mapping profile, normalization pipeline, gated mapping, API map route, tests |
| S07 | snapshot_creation_and_lineage | ACCEPTED | 2026-04-07 | Intake sealed snapshot, lineage, gating, audit SEAL, API + tests; ADR-006 |

### S05 — intake_upload_and_validation

**Purpose:** Implement the file upload intake path and source data validation layer. Uploaded files are parsed, structurally validated, and quarantined if invalid. No normalization yet.

**Owned Files (S05 delivery):**
- `packages/contracts/src/enums/intake-file-status.ts`
- `packages/contracts/src/enums/intake-column-type.ts`
- `packages/contracts/src/enums/structural-issue-code.ts`
- `packages/contracts/src/enums/index.ts` (exports for the above)
- `packages/contracts/src/types/intake.ts`
- `packages/contracts/src/types/index.ts` (intake exports)
- `packages/contracts/src/schemas/enums.ts` (intake enum schemas)
- `packages/contracts/src/schemas/intake.ts`
- `packages/contracts/src/schemas/index.ts` (intake schema exports)
- `packages/contracts/src/__tests__/schemas.test.ts` (intake structural schema cases)
- `packages/intake-engine/` (package: `package.json`, `tsconfig.json`, `jest.config.js`, `src/index.ts`, `src/default-layout.ts`, `src/csv-structural.ts`, `src/memory-store.ts`, `src/intake-service.ts`, `src/__tests__/`)
- `apps/api/src/app.ts`
- `apps/api/src/index.ts` (HTTP server bootstrap + `createApiApp` re-export)
- `apps/api/package.json`
- `apps/api/jest.config.js`
- `apps/api/src/__tests__/intake-upload.test.ts`
- `jest.config.base.js` (ts-jest `esModuleInterop` for default imports in tests)
- `docs/adr/ADR-005-intake-engine-package.md`
- `.claude/SLICE_QUEUE.md` (this file — S05 status only)

**Acceptance Criteria:**
- [x] Supported source formats can be uploaded and parsed (CSV minimum; XLSX as stretch)
- [x] Structural validation reports missing required columns, type mismatches, and empty required fields
- [x] Invalid files are quarantined — they cannot proceed to the mapping stage
- [x] Upload is recorded in the audit log
- [x] Unit and integration tests cover valid and invalid file scenarios

**Blockers / Review Notes:**
- XLSX explicitly deferred (stretch). CSV uses a minimal comma-split parser (no quoted-field support in S05).

**Completion record — 2026-04-06:**
- Status set to **ACCEPTED**
- ADR-005 filed: `docs/adr/ADR-005-intake-engine-package.md`
- `pnpm install` — PASS (workspace includes `@enx/intake-engine`, `apps/api` deps)
- `pnpm typecheck` — PASS (all workspace projects, 0 TS errors)
- `pnpm lint` — PASS
- `pnpm test` — PASS (24 suites, 257 tests, 0 failures)
- Intake flow: `POST /v1/intake/files` → `registerIntakeFile` → audit `UPLOAD` + `SUBMIT` (outcome from structural result) → record `STRUCTURALLY_VALID` or `QUARANTINED` with structured `StructuralIssueCode`s
- S06 unblocked (not started)

---

### S06 — mapping_and_normalization_pipeline

**Purpose:** Map source columns to stable logical intake fields, normalize raw cell values into deterministic intermediate scalars, capture structured mapping/normalization issues, and gate mapping so only structurally valid intake files are processed. This slice produces **intermediate** normalized rows for later canonical binding in downstream slices; it does not persist canonical worker/pay entities or create snapshots.

**Owned Files (S06 delivery):**
- `packages/contracts/src/enums/logical-intake-field.ts`
- `packages/contracts/src/enums/mapping-normalization-issue-code.ts`
- `packages/contracts/src/enums/index.ts` (exports)
- `packages/contracts/src/types/mapping-normalization.ts`
- `packages/contracts/src/types/index.ts` (exports)
- `packages/contracts/src/schemas/enums.ts` (Zod for new enums)
- `packages/contracts/src/schemas/mapping-normalization.ts`
- `packages/contracts/src/schemas/index.ts` (exports)
- `packages/contracts/src/__tests__/mapping-normalization-schemas.test.ts`
- `packages/intake-engine/src/default-mapping-profile.ts`
- `packages/intake-engine/src/normalize-scalars.ts`
- `packages/intake-engine/src/mapping-pipeline.ts`
- `packages/intake-engine/src/mapping-service.ts`
- `packages/intake-engine/src/index.ts` (exports)
- `packages/intake-engine/src/__tests__/normalize-scalars.test.ts`
- `packages/intake-engine/src/__tests__/mapping-pipeline.test.ts`
- `packages/intake-engine/src/__tests__/mapping-service.test.ts`
- `apps/api/src/app.ts` (POST `/v1/intake/files/:intakeFileId/map`)
- `apps/api/src/__tests__/intake-map.test.ts`
- `.claude/SLICE_QUEUE.md` (this file — S06 status only)

**Acceptance Criteria (S06 slice contract — intermediate mapping layer):**
- [x] Source field mapping configuration is defined per intake source (`IntakeMappingProfile` + default profile aligned to default CSV layout)
- [x] Every source row is mapped to normalized logical field values or flagged with coded row-level issues; file-level issues cover missing profile mappings and absent source columns
- [x] Invalid or incomplete normalization is surfaced with stable issue codes; downstream consumers treat `ok: false` as blocking for snapshot creation (enforced in S07+)
- [x] Mapping runs are audited with `AuditAction.UPDATE` and metadata including profile id/version, gated flag, ok flag, and issue counts
- [x] Unit tests cover normalization helpers, mapping pipeline (gate, profile errors, bad values, deterministic happy path), mapping service + audit, and API map route

**Blockers / Review Notes:**
- Blocked on S05 — cleared 2026-04-06
- Queue text for S06 previously referenced “canonical worker and pay record”; implementation matches the **control-tower slice brief**: intermediate normalized records only, no canonical persistence in S06

**Completion record — 2026-04-06:**
- Status set to **ACCEPTED**
- `pnpm test` — PASS (29 suites, 276 tests, 0 failures)
- `pnpm typecheck` — PASS (0 TS errors across workspace projects)
- `pnpm lint` — PASS
- API: `POST /v1/intake/files/:intakeFileId/map` returns `MappingNormalizationResult` JSON; quarantined files yield `gated: true` and no row processing; unknown id → 404
- S07 unblocked (not started)

---

### S07 — snapshot_creation_and_lineage

**Purpose:** Seal normalized intake mapping output into an immutable **intake snapshot** with explicit lineage (intake file, content hash, mapping profile, methodology/rule pack versions, actor, seal time). Enforce gating so invalid, gated, or incomplete mapping cannot produce a snapshot. Emit audit events for seal success and failure. Provide a minimal HTTP path for the full upload→snapshot flow. This is a **control boundary** only: no canonical worker/pay persistence, no classification, metrics, or reporting.

**Owned Files (S07 delivery):**
- `packages/contracts/src/enums/intake-snapshot-blocked-reason.ts`
- `packages/contracts/src/enums/index.ts` (export)
- `packages/contracts/src/types/intake-snapshot.ts`
- `packages/contracts/src/types/index.ts` (export)
- `packages/contracts/src/schemas/intake-snapshot.ts`
- `packages/contracts/src/schemas/enums.ts` (`IntakeSnapshotBlockedReasonSchema`)
- `packages/contracts/src/schemas/index.ts` (exports)
- `packages/contracts/src/__tests__/intake-snapshot-schemas.test.ts`
- `packages/contracts/src/__tests__/enums.test.ts` (IntakeSnapshotBlockedReason coverage)
- `packages/contracts/src/__tests__/schemas.test.ts` (blocked-reason schema case)
- `packages/canonical-model/src/intake-sealed-snapshot.ts`
- `packages/canonical-model/src/index.ts` (exports)
- `packages/canonical-model/src/__tests__/intake-sealed-snapshot.test.ts`
- `packages/intake-engine/package.json` (`@enx/canonical-model` dependency)
- `packages/intake-engine/src/snapshot-creation.ts`
- `packages/intake-engine/src/snapshot-store.ts`
- `packages/intake-engine/src/snapshot-service.ts`
- `packages/intake-engine/src/index.ts` (exports)
- `packages/intake-engine/src/__tests__/snapshot-creation.test.ts`
- `packages/intake-engine/src/__tests__/snapshot-service.test.ts`
- `apps/api/src/app.ts` (`POST /v1/intake/files/:intakeFileId/snapshots`, `express.json`, optional `sealedSnapshotStore`)
- `apps/api/package.json` (`@enx/contracts` dependency)
- `apps/api/src/__tests__/intake-snapshot.test.ts`
- `docs/adr/ADR-006-intake-sealed-snapshot.md`
- `.claude/SLICE_QUEUE.md` (this file — S07 status only)

**Acceptance Criteria:**
- [x] Snapshot creation is blocked if any records are unmapped
- [x] Snapshot carries full lineage metadata
- [x] Snapshot status transitions are audited
- [x] Snapshot cannot be modified after SEALED status
- [x] Integration tests verify the full intake-to-snapshot path

**Blockers / Review Notes:**
- Blocked on S06 — cleared 2026-04-07
- “Unmapped” enforced via S06 `gated` / `ok` / file issues, empty row set, row issues, and required logical field presence checks (`IntakeSnapshotBlockedReason`)

**Completion record — 2026-04-07:**
- Status set to **ACCEPTED**
- ADR-006 filed: `docs/adr/ADR-006-intake-sealed-snapshot.md`
- `pnpm test` — PASS (34 suites, 292 tests, 0 failures)
- `pnpm typecheck` — PASS (0 TS errors)
- `pnpm lint` — PASS
- API: `POST /v1/intake/files/:intakeFileId/snapshots` with `{ methodologyVersion, rulePackVersion }` → `201` + `IntakeSealedSnapshot` JSON, or `422` + `blockedReasons`; quarantined / bad mapping blocked; unknown intake → `404`
- S08 next (PENDING; per queue, blocked on **M1 Gate** until formally closed — S05–S07 are now all ACCEPTED)

---

## WAVE 2 — JOB ARCHITECTURE AND COMPARABLE CATEGORIES

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S08 | job_normalization_core | ACCEPTED | 2026-04-07 | `@enx/job-architecture`, contracts job norm + logical job fields, intake optional job columns, ADR-007; validation green |
| S09 | category_engine_exact_and_normalized | ACCEPTED | 2026-04-07 | `@enx/category-engine`, contracts category assignment types/issues, ADR-008; exact + norm-equiv + review/unassigned; tests green |
| S10 | category_engine_equal_value_and_overrides | ACCEPTED | 2026-04-07 | Equal-value ruleset + governed overrides + metrics gate fields; ADR-009; tests green |

### S08 — job_normalization_core

**Purpose:** Normalize source job titles and optional hierarchy hints from sealed intake snapshot rows into stable, reviewable job descriptors (titles, family/subfamily codes, grade/level) with deterministic rules and structured issues. No comparable-worker category assignment, equal-value logic, metrics, reporting, or country overlays.

**Owned Files (S08 delivery):**
- `packages/contracts/src/enums/logical-intake-field.ts` (JOB_* logical fields)
- `packages/contracts/src/enums/job-normalization-issue-code.ts`
- `packages/contracts/src/enums/index.ts` (export)
- `packages/contracts/src/types/job-normalization.ts`
- `packages/contracts/src/types/index.ts` (export)
- `packages/contracts/src/schemas/enums.ts` (`JobNormalizationIssueCodeSchema`)
- `packages/contracts/src/schemas/job-normalization.ts`
- `packages/contracts/src/schemas/mapping-normalization.ts` (Zod keys for new logical fields)
- `packages/contracts/src/schemas/index.ts` (export)
- `packages/contracts/src/__tests__/job-normalization-schemas.test.ts`
- `packages/intake-engine/src/normalize-scalars.ts` (`normalizeLogicalStringField`)
- `packages/intake-engine/src/mapping-pipeline.ts` (optional mapped logical fields when CSV headers exist)
- `packages/intake-engine/src/__tests__/normalize-scalars.test.ts`
- `packages/intake-engine/src/__tests__/mapping-pipeline.test.ts`
- `packages/job-architecture/` (package: `package.json`, `tsconfig.json`, `jest.config.js`, `src/index.ts`, `src/job-normalization-rules-version.ts`, `src/extract-raw-job-inputs.ts`, `src/normalize-title.ts`, `src/normalize-code.ts`, `src/normalize-grade.ts`, `src/normalize-job-row.ts`, `src/job-normalization-pipeline.ts`, `src/job-normalization-service.ts`, `src/__tests__/`)
- `docs/adr/ADR-007-job-architecture-package.md`
- `.claude/SLICE_QUEUE.md` (this file — S08 status only)

**Acceptance Criteria:**
- [x] Job normalization maps source titles (and optional job fields from intake values) to a normalized job descriptor shape with recorded `jobNormalizationRulesVersion`
- [x] Normalization is version-controlled — the rules version is recorded on every descriptor and snapshot-level result
- [x] Missing, invalid, ambiguous, or unmapped job inputs surface as structured `JobNormalizationIssueCode` issues, not silent failures
- [x] Unit and pipeline/service tests cover success paths, missing title, wrong scalar kinds, invalid/ambiguous grade, deterministic ordering, sealed snapshot consumption, audit emission, and scope guard (no category engine leakage)

**Blockers / Review Notes:**
- Blocked on M1 Gate — **cleared** for this branch: S05–S07 are ACCEPTED (2026-04-06/07).

**Completion record — 2026-04-07:**
- Status set to **ACCEPTED**
- ADR-007 filed: `docs/adr/ADR-007-job-architecture-package.md`
- `pnpm test` — PASS (42 suites, 314 tests, 0 failures)
- `pnpm typecheck` — PASS (0 TS errors across workspace projects including `@enx/job-architecture`)
- `pnpm lint` — PASS
- Exports: `runJobNormalizationOnSealedSnapshot`, `runJobNormalizationWithAudit`, row helpers; intake optional `JOB_*` columns when mapped and present in CSV (backward compatible when columns absent)
- S09 next (PENDING, not started)

---

### S09 — category_engine_exact_and_normalized

**Purpose:** Assign workers to comparable categories using exact and normalized job matching. Produce a traceable category assignment for every worker in a snapshot.

**Owned Files (S09 delivery):**
- `packages/contracts/src/enums/category-assignment-status.ts`
- `packages/contracts/src/enums/category-assignment-basis.ts`
- `packages/contracts/src/enums/category-assignment-issue-code.ts`
- `packages/contracts/src/enums/index.ts` (exports)
- `packages/contracts/src/types/category-assignment.ts`
- `packages/contracts/src/types/index.ts` (exports)
- `packages/contracts/src/schemas/enums.ts` (Zod for new enums)
- `packages/contracts/src/schemas/category-assignment.ts`
- `packages/contracts/src/schemas/index.ts` (exports)
- `packages/contracts/src/__tests__/category-assignment-schemas.test.ts`
- `packages/category-engine/` (package: `package.json`, `tsconfig.json`, `jest.config.js`, `src/index.ts`, `src/category-assignment-rules-version.ts`, `src/deterministic-category-id.ts`, `src/assign-category-row.ts`, `src/category-assignment-pipeline.ts`, `src/category-assignment-service.ts`, `src/__tests__/`)
- `docs/adr/ADR-008-category-engine-package.md`
- `.claude/SLICE_QUEUE.md` (this file — S09 status only)

**Acceptance Criteria:**
- [x] Every worker in a snapshot receives a category assignment or an explicit exception
- [x] Category assignment is traceable to rule version and methodology version
- [x] Exact match and normalized match paths are both implemented and tested
- [x] No worker can remain unassigned and silently pass to metrics calculation

**Blockers / Review Notes:**
- Blocked on S08 — cleared 2026-04-07
- Rows with any job-normalization issue receive `REVIEW_REQUIRED` (no category) so categories are not silently assigned on dirty descriptors; `NORMALIZED_EQUIVALENT` without title is covered with synthetic clean rows in tests (current S08 pipeline attaches an issue when title is missing)

**Completion record — 2026-04-07:**
- Status set to **ACCEPTED**
- ADR-008 filed: `docs/adr/ADR-008-category-engine-package.md`
- `pnpm test` — PASS (48 suites, 328 tests, 0 failures)
- `pnpm typecheck` — PASS (0 TS errors; `@enx/category-engine` included)
- `pnpm lint` — PASS
- Exports: `runCategoryAssignmentOnJobNormalization`, `runCategoryAssignmentWithAudit`, `assignCategoryToJobNormalizationRow`, `DEFAULT_CATEGORY_ENGINE_RULES_VERSION`; per-row `CategoryAssignmentStatus` (`ASSIGNED` | `REVIEW_REQUIRED` | `UNASSIGNED`), basis `EXACT` | `NORMALIZED_EQUIVALENT`, deterministic `categoryId`, traceability (methodology, rule pack, job-norm rules, category-engine rules)
- S10 next (PENDING, not started)

---

### S10 — category_engine_equal_value_and_overrides

**Purpose:** Extend category engine with equal-value work grouping and a governed override mechanism. Overrides must be reviewed and approved before they affect outputs.

**Owned Files (S10 delivery):**
- `packages/contracts/src/enums/category-assignment-basis.ts` (`EQUAL_VALUE`, `OVERRIDE`)
- `packages/contracts/src/enums/category-assignment-issue-code.ts` (equal-value + governed override issues)
- `packages/contracts/src/enums/category-override-status.ts`
- `packages/contracts/src/enums/index.ts` (exports)
- `packages/contracts/src/types/category-assignment.ts` (S10 row/snapshot fields, `EqualValueRuleset`, `CategoryOverrideRecord`, traceability extensions)
- `packages/contracts/src/types/index.ts` (exports)
- `packages/contracts/src/schemas/enums.ts` (`CategoryOverrideStatusSchema`)
- `packages/contracts/src/schemas/category-assignment.ts` (row/snapshot + equal-value + override Zod)
- `packages/contracts/src/schemas/index.ts` (exports)
- `packages/contracts/src/__tests__/category-assignment-schemas.test.ts`
- `packages/category-engine/src/deterministic-category-id.ts` (`CategoryIdBasis`, exported `canonicalJsonStringify`)
- `packages/category-engine/src/deterministic-override-id.ts`
- `packages/category-engine/src/assign-category-row.ts` (S10 row defaults: `metricsCalculationBlocked`, override/equal-value nulls)
- `packages/category-engine/src/category-assignment-pipeline.ts` (`metricsCalculationBlockedCount`)
- `packages/category-engine/src/equal-value-grouping.ts`
- `packages/category-engine/src/governed-override.ts`
- `packages/category-engine/src/extended-category-assignment-pipeline.ts`
- `packages/category-engine/src/extended-category-assignment-service.ts`
- `packages/category-engine/src/override-decision-audit.ts`
- `packages/category-engine/src/index.ts` (exports)
- `packages/category-engine/src/__tests__/assign-category-row.test.ts`
- `packages/category-engine/src/__tests__/category-assignment-pipeline.test.ts`
- `packages/category-engine/src/__tests__/equal-value-grouping.test.ts`
- `packages/category-engine/src/__tests__/governed-override.test.ts`
- `packages/category-engine/src/__tests__/extended-category-assignment-pipeline.test.ts`
- `packages/category-engine/src/__tests__/extended-category-assignment-service.test.ts`
- `packages/category-engine/src/__tests__/deterministic-override-id.test.ts`
- `packages/category-engine/src/__tests__/override-decision-audit.test.ts`
- `packages/category-engine/src/__tests__/no-metrics-leakage.test.ts` (replaces S09 `no-equal-value-leakage.test.ts` — S10 owns equal-value in-package)
- `docs/adr/ADR-009-category-engine-equal-value-overrides.md`
- `.claude/SLICE_QUEUE.md` (this file — S10 status only)

**Cross-slice note:** Deleted `packages/category-engine/src/__tests__/no-equal-value-leakage.test.ts` (S09 guard forbidding equal-value strings in `src/`). Replaced by `no-metrics-leakage.test.ts` so S10 implementation is allowed while pay-gap / `metrics-engine` references remain forbidden in production sources.

**Acceptance Criteria:**
- [x] Equal-value grouping logic is implemented per the methodology specification (explicit versioned `EqualValueRuleset`, deterministic group/member ordering, distinct `EQUAL_VALUE` basis and category id)
- [x] Override workflow requires explicit reviewer approval (only `APPROVED` applies; `PENDING`/`REJECTED` enforced in engine; no auto-approval)
- [x] Unapproved overrides block metrics calculation for affected workers (`metricsCalculationBlocked` / `metricsCalculationBlockedCount` gate for S11+; no metrics math in this slice)
- [x] All overrides are audited with reviewer identity and timestamp (`writeCategoryOverrideDecisionAudit` for approve/reject; caller supplies reviewer actor and `decidedAtIso` aligned with the override record)
- [x] Unit and integration tests cover override approval and rejection paths, equal-value success/failure, pending non-application, traceability, and no pay-gap / `metrics-engine` leakage in `src/`

**Blockers / Review Notes:**
- Blocked on S09 — cleared 2026-04-07

**Completion record — 2026-04-07:**
- Status set to **ACCEPTED**
- ADR-009 filed: `docs/adr/ADR-009-category-engine-equal-value-overrides.md`
- `pnpm test` — PASS (54 suites, 351 tests, 0 failures)
- `pnpm typecheck` — PASS (0 TS errors)
- `pnpm lint` — PASS
- Primary API: `runExtendedCategoryAssignmentOnJobNormalization`, `runExtendedCategoryAssignmentWithAudit`, `applyGovernedCategoryOverride`, `tryEqualValueCategoryAssignment`, `writeCategoryOverrideDecisionAudit`, `deterministicCategoryOverrideId`
- S11 next (PENDING, not started; blocked on **M2 Gate** until S08–S10 all ACCEPTED on branch)

---

## WAVE 3 — METRICS AND REPORTING CORE

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S11 | metrics_eu_core | ACCEPTED | 2026-04-07 | `@enx/metrics-engine`, EU core contracts/schemas, audit hook, ADR-010; validation green |
| S12 | reporting_pack_base | PENDING | — | Blocked on S11 |
| S13 | group_dashboard_core | PENDING | — | Blocked on S12 |

### S11 — metrics_eu_core

**Purpose:** Implement the EU Pay Transparency Directive core metric calculations: mean and median pay gap by gender, bonus gap, pay quartile distribution. Calculations must be deterministic and testable against known reference values.

**Owned Files (S11 delivery):**
- `packages/contracts/src/enums/eu-core-metric-id.ts`
- `packages/contracts/src/enums/eu-core-metric-result-status.ts`
- `packages/contracts/src/enums/index.ts` (exports)
- `packages/contracts/src/types/eu-core-metrics.ts`
- `packages/contracts/src/types/index.ts` (exports)
- `packages/contracts/src/schemas/enums.ts` (EU core enum Zod)
- `packages/contracts/src/schemas/eu-core-metrics.ts`
- `packages/contracts/src/schemas/index.ts` (exports)
- `packages/contracts/src/__tests__/eu-core-metrics-schemas.test.ts`
- `packages/metrics-engine/` (package: `package.json`, `tsconfig.json`, `jest.config.js`, `src/index.ts`, `src/eu-core/decimal-parse.ts`, `src/eu-core/statistics.ts`, `src/eu-core/run-eu-core-metrics.ts`, `src/eu-core/metrics-audit.ts`, `src/__tests__/`)
- `docs/adr/ADR-010-metrics-engine-package.md`
- `.claude/SLICE_QUEUE.md` (this file — S11 status only)

**Acceptance Criteria:**
- [x] Mean and median gender pay gap calculations are correct against reference test fixtures
- [x] Bonus gap and pay quartile distribution are implemented
- [x] All calculations reference the snapshot ID and methodology version
- [x] Calculations are blocked if category assignments are incomplete
- [x] Unit tests use fixed input fixtures with known expected outputs

**Blockers / Review Notes:**
- Blocked on M2 Gate — **cleared** on branch: S08–S10 ACCEPTED (2026-04-07).

**Completion record — 2026-04-07:**
- Status set to **ACCEPTED**
- ADR-010 filed: `docs/adr/ADR-010-metrics-engine-package.md`
- `pnpm test` — PASS (59 suites, 367 tests, 0 failures)
- `pnpm typecheck` — PASS (0 TS errors across workspace projects including `@enx/metrics-engine`)
- `pnpm lint` — PASS
- Primary API: `runEuCoreMetrics`, `writeEuCoreMetricsRunAudit` / `buildEuCoreMetricsRunAuditInput`; EU core result contracts `EuCoreMetricsRunResult` + inclusion/exclusion summary; variable pay via optional `variablePayRows`; snapshot gate blocks headline metrics when `unassignedCount` or `reviewRequiredCount` is non-zero
- S12 next (PENDING, not started)

---

### S12 — reporting_pack_base

**Purpose:** Generate a base evidence pack from a completed metrics run. The pack must be audit-ready: structured, signed, and complete enough for external review.

**Acceptance Criteria:**
- [ ] Evidence pack includes: snapshot metadata, methodology version, metric outputs, category summary, data quality notes
- [ ] Pack is generated as a structured format (JSON + PDF stub minimum)
- [ ] Pack includes reviewer attestation section
- [ ] Incomplete packs cannot be exported
- [ ] Unit tests cover pack generation and completeness checks

**Blockers / Review Notes:**
- Blocked on S11

---

### S13 — group_dashboard_core

**Purpose:** Implement the core group-level dashboard view: summary metrics across all entities in a snapshot, status indicators for completeness and gate compliance.

**Acceptance Criteria:**
- [ ] Dashboard aggregates metrics across all entities in a snapshot
- [ ] Incomplete or blocked entities are visually flagged
- [ ] Dashboard data is read-only — no modifications allowed from the dashboard
- [ ] Integration tests verify aggregation correctness

**Blockers / Review Notes:**
- Blocked on S12

---

## WAVE 4 — CASEWORK AND REMEDIATION

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S14 | casework_request_intake | PENDING | — | Blocked on M3 Gate |
| S15 | casework_response_and_review | PENDING | — | Blocked on S14 |
| S16 | remediation_issue_register | PENDING | — | Blocked on M3 Gate |
| S17 | remediation_actions_and_closure | PENDING | — | Blocked on S16 |

### S14 — casework_request_intake

**Purpose:** Allow a worker (or representative) to submit an information request. Capture the request, link it to the relevant snapshot, and start the response clock.

**Acceptance Criteria:**
- [ ] Request submission captures: worker ID, request type, date received, linked snapshot
- [ ] Response deadline is calculated from the statutory window (country-configurable)
- [ ] Request is logged in the audit trail at intake
- [ ] Unit tests cover intake and deadline calculation

**Blockers / Review Notes:**
- Blocked on M3 Gate

---

### S15 — casework_response_and_review

**Purpose:** Implement the response drafting, review, and dispatch workflow for worker information requests.

**Acceptance Criteria:**
- [ ] Response can be drafted, reviewed, approved, and dispatched
- [ ] Dispatch is audited with responder identity and timestamp
- [ ] Overdue requests are surfaced automatically
- [ ] Integration tests cover the full request-to-response workflow

**Blockers / Review Notes:**
- Blocked on S14

---

### S16 — remediation_issue_register

**Purpose:** Implement the remediation issue register. Issues can be raised against a snapshot, an entity, or an individual worker record.

**Acceptance Criteria:**
- [ ] Issues can be created with: type, severity, linked entity, description, raised by, date
- [ ] Issue status transitions are audited
- [ ] Open issues on a snapshot block final attestation
- [ ] Unit tests cover issue creation and status transitions

**Blockers / Review Notes:**
- Blocked on M3 Gate

---

### S17 — remediation_actions_and_closure

**Purpose:** Implement action tracking against remediation issues, and the closure workflow with evidence attachment.

**Acceptance Criteria:**
- [ ] Actions can be assigned, tracked, and completed against an issue
- [ ] Closure requires at least one completed action and a reviewer sign-off
- [ ] Closure evidence is stored and linked to the issue record
- [ ] Integration tests cover the full issue-to-closure workflow

**Blockers / Review Notes:**
- Blocked on S16

---

## WAVE 5 — POLICY AND RECRUITING CONTROLS

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S18 | policy_registry_core | PENDING | — | Blocked on M4 Gate |
| S19 | recruiting_controls_core | PENDING | — | Blocked on S18 |

### S18 — policy_registry_core

**Purpose:** Implement the policy registry: versioned rule packs, methodology documents, and their approval workflow.

**Acceptance Criteria:**
- [ ] Rule packs are versioned and immutable once approved
- [ ] Approval workflow requires a named approver and timestamp
- [ ] Downstream engines reference the rule pack version, not the latest
- [ ] Unit tests cover versioning and approval flow

**Blockers / Review Notes:**
- Blocked on M4 Gate

---

### S19 — recruiting_controls_core

**Purpose:** Implement the job posting compliance check engine. Verify that job postings meet pay transparency requirements before publication.

**Acceptance Criteria:**
- [ ] Posting check validates: pay range present, pay range defensible against job level, required disclosures included
- [ ] Check results are logged
- [ ] Failed checks block posting (or flag for manual review, per configuration)
- [ ] Unit tests cover pass, fail, and manual-review paths

**Blockers / Review Notes:**
- Blocked on S18

---

## WAVE 6 — COUNTRY PACKS

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S20 | country_pack_ireland | PENDING | — | Blocked on M5 Gate |
| S21 | country_pack_uk | PENDING | — | Blocked on M5 Gate |
| S22 | country_pack_norway | PENDING | — | Blocked on M5 Gate |
| S23 | country_pack_belgium | PENDING | — | Blocked on M5 Gate |
| S24 | country_pack_denmark | PENDING | — | Blocked on M5 Gate |
| S25 | country_pack_france | PENDING | — | Blocked on M5 Gate |
| S26 | country_pack_germany | PENDING | — | Blocked on M5 Gate |
| S27 | country_pack_italy | PENDING | — | Blocked on M5 Gate |
| S28 | country_pack_netherlands | PENDING | — | Blocked on M5 Gate |
| S29 | country_pack_portugal | PENDING | — | Blocked on M5 Gate |
| S30 | country_pack_spain | PENDING | — | Blocked on M5 Gate |
| S31 | country_pack_sweden | PENDING | — | Blocked on M5 Gate |

Each country pack slice follows the same structure. Before starting any country pack:
- Confirm the core metric interfaces are finalized (no pending changes to `metrics-engine` API)
- Confirm the reporting template interface is finalized
- Confirm the casework deadline configuration interface is finalized
- Research and document the country's specific statutory requirements before implementing

Each country pack must provide:
- Statutory metric definitions and any country-specific formulas
- Classification rule extensions (if applicable)
- Reporting template (structure and required fields)
- Statutory reporting deadlines and periods
- Casework response window
- Legal reference documentation (for `docs/country-guides/`)

Country packs are independent of each other and may be executed in parallel if resources allow, subject to the M5 Gate being passed.

---

## WAVE 7 — HARDENING AND RELEASE

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S32 | evidence_pack_viewer | PENDING | — | Blocked on M6 Gate |
| S33 | admin_rule_pack_management | PENDING | — | Blocked on M6 Gate |
| S34 | security_hardening_and_role_matrix | PENDING | — | Blocked on M6 Gate |
| S35 | e2e_release_runbooks | PENDING | — | Blocked on S32–S34 |

### S32 — evidence_pack_viewer

**Purpose:** Implement the read-only evidence pack viewer for regulators and auditors. Packs must be viewable without modification.

**Acceptance Criteria:**
- [ ] Evidence packs are browsable in a structured view
- [ ] No modification is possible from the viewer
- [ ] Access is logged

**Blockers / Review Notes:**
- Blocked on M6 Gate

---

### S33 — admin_rule_pack_management

**Purpose:** Implement the admin interface for creating, versioning, and approving rule packs and methodology documents.

**Acceptance Criteria:**
- [ ] Admins can create new rule pack versions
- [ ] Approval workflow enforces two-person sign-off
- [ ] All changes are audited

**Blockers / Review Notes:**
- Blocked on M6 Gate

---

### S34 — security_hardening_and_role_matrix

**Purpose:** Implement the final RBAC role matrix, conduct a security review, and resolve all outstanding security findings.

**Acceptance Criteria:**
- [ ] All roles are defined with minimum required permissions
- [ ] No role has broader access than required
- [ ] PII access is logged for all retrieval operations
- [ ] Security review findings are documented and resolved

**Blockers / Review Notes:**
- Blocked on M6 Gate

---

### S35 — e2e_release_runbooks

**Purpose:** Write and validate end-to-end release runbooks. Run the full E2E test suite. Confirm the system is release-ready.

**Acceptance Criteria:**
- [ ] E2E tests cover all primary user workflows
- [ ] Runbooks exist for: deployment, rollback, data ingestion, evidence pack generation, casework response
- [ ] All E2E tests pass
- [ ] Release checklist completed and signed off

**Blockers / Review Notes:**
- Blocked on S32, S33, S34

---

## STATUS KEY

| Status | Meaning |
|---|---|
| PENDING | Not started. Waiting for predecessor slice or milestone gate |
| ACTIVE | Currently being executed |
| IN REVIEW | Implementation complete, under acceptance verification |
| ACCEPTED | All acceptance criteria met, tests pass, ADRs filed |
| BLOCKED | Cannot proceed — blocker logged above |
| DEFERRED | Formally deferred with documented rationale |

---

## CHANGE LOG

| Date | Change | Author |
|---|---|---|
| 2026-04-05 | Initial slice queue created | Governance setup |
| 2026-04-05 | S01 scope corrected: added structural shells for apps/api, apps/web, apps/worker, packages/contracts, packages/canonical-model, packages/audit, packages/security, packages/test-fixtures. Removed contradictory acceptance criterion. Added shell-awareness notes to S02, S03, S04. | Governance correction |
| 2026-04-05 | S01 ACCEPTED. All 11 acceptance criteria met. ADR-001 filed. pnpm/lint/typecheck/test all pass. S02 unblocked. | S01 completion |
| 2026-04-05 | S02 ACCEPTED. All 7 acceptance criteria met. ADR-002 filed. 47 tests pass. 10 enums, 4 types, 12 Zod schemas. S03 unblocked. | S02 completion |
| 2026-04-06 | ADR renumber: canonical model → ADR-003 (`ADR-003-canonical-model-structure.md`); audit/security baseline → ADR-004 (`ADR-004-audit-security-baseline-structure.md`). Zod ADR remains ADR-002. Queue: S04 IN REVIEW (PR #3); S05 set as next slice (BLOCKED until M0). | Post-S04 docs hygiene |
| 2026-04-06 | PR #3 merged to `claude/setup-repo-structure-dGb6o`. S04 ACCEPTED. M0 / Wave 0 closed. S05 → PENDING (next slice, not started). Validation passed on integration. | M0 closure |
| 2026-04-06 | S05 ACCEPTED: intake upload + structural validation + quarantine + audit; `@enx/intake-engine`; API route; ADR-005; `pnpm test` / `typecheck` / `lint` green. S06 next (PENDING). | S05 completion |
| 2026-04-06 | S06 ACCEPTED: mapping + normalization pipeline (logical fields, issues, gating, default profile, audit on map, POST map route); contracts + intake-engine + API tests; validation green. S07 next (PENDING). | S06 completion |
| 2026-04-07 | S07 ACCEPTED: intake sealed snapshot + deterministic manifest id, lineage, gating vs S06 output, audit `SEAL`, deep-frozen `SEALED` records, `POST .../snapshots`; contracts + canonical-model + intake-engine + API tests; ADR-006; validation green. S08 next (PENDING, M1 Gate). | S07 completion |
| 2026-04-07 | S08 ACCEPTED: job normalization package `@enx/job-architecture`, contracts job norm types/issues + `JOB_*` logical fields, intake optional job column mapping, pipeline + audit service, tests + ADR-007; `pnpm test` / `typecheck` / `lint` green. S09 next (PENDING). | S08 completion |
| 2026-04-07 | S09 ACCEPTED: category engine `@enx/category-engine`, contracts category assignment enums/types/schemas + tests, exact vs normalized-equivalent keys + deterministic category IDs, review-required/unassigned outcomes, audit hook on assignment run, ADR-008; `pnpm test` / `typecheck` / `lint` green. S10 next (PENDING). | S09 completion |
| 2026-04-07 | S10 ACCEPTED: equal-value ruleset + `EQUAL_VALUE` basis, governed `CategoryOverrideRecord` (`PENDING`/`APPROVED`/`REJECTED`), row metrics gate fields + snapshot `metricsCalculationBlockedCount`, override decision audit helper, extended pipeline/service; contracts/schemas/tests; ADR-009; replaced S09 equal-value leakage test with metrics-engine/pay-gap guard; `pnpm test` / `typecheck` / `lint` green. S11 next (PENDING). | S10 completion |
| 2026-04-07 | S11 ACCEPTED: `@enx/metrics-engine` EU core `runEuCoreMetrics` (mean/median gap %, optional mean variable gap, quartile distribution), first-class inclusion/exclusion + `metricsCalculationBlocked` exclusion, classification incomplete gate, contracts enums/types/schemas + schema tests, audit write helper, ADR-010; `pnpm test` / `typecheck` / `lint` green. S12 next (PENDING). | S11 completion |
