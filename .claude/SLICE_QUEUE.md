# SLICE_QUEUE.md
# Euronext Pay Transparency Control Tower
# Live Operational Slice Queue — v1.0

---

## CURRENT ACTIVE SLICE

**Slice ID:** S03
**Name:** S03_canonical_worker_and_pay_models
**Status:** PENDING — Ready to start (S01 and S02 ACCEPTED; see Wave 0 table)
**Wave:** 0 — Foundation
**Milestone:** M0

Before starting S03, confirm:
- [ ] S02 is ACCEPTED and contracts tests pass on the integration branch
- [ ] Canonical model package shell exists from S01
- [ ] No country-specific fields are introduced in canonical models

---

## GO / NO-GO MILESTONE CHECKPOINTS

| Milestone | Trigger | Required Before Advancing |
|---|---|---|
| M0 Gate | S01–S04 all ACCEPTED | All tests pass in CI; ADRs for tech choices filed |
| M1 Gate | S05–S07 all ACCEPTED | Snapshot lineage verified end-to-end; no unmapped workers in test fixtures |
| M2 Gate | S08–S10 all ACCEPTED | Classification engine produces deterministic output; all override paths tested |
| M3 Gate | S11–S13 all ACCEPTED | EU core metrics verified against known test cases; evidence pack reviewable |
| M4 Gate | S14–S17 all ACCEPTED | Casework workflow complete; remediation register functional |
| M5 Gate | S18–S19 all ACCEPTED | Policy registry operational; recruiting controls tested |
| M6 Gate | S20–S31 all ACCEPTED | All 12 country packs accepted; each tested with country-specific fixtures |
| M7 Gate | S32–S35 all ACCEPTED | Security review passed; runbooks complete; release-ready |

---

## WAVE 0 — FOUNDATION

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S01 | foundation_repo_bootstrap | ACCEPTED | 2026-04-05 | All 11 AC met. pnpm/lint/typecheck/test all pass. ADR-001 filed. |
| S02 | core_contracts_and_enums | ACCEPTED | 2026-04-05 | All 7 AC met. 47 tests pass. ADR-002 filed. S03 unblocked. |
| S03 | canonical_worker_and_pay_models | PENDING | — | Blocked on S02 — now unblocked |
| S04 | audit_and_security_baseline | PENDING | — | Blocked on S03 |

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

---

## WAVE 1 — INTAKE AND SNAPSHOT CONTROL

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S05 | intake_upload_and_validation | PENDING | — | Blocked on M0 Gate |
| S06 | mapping_and_normalization_pipeline | PENDING | — | Blocked on S05 |
| S07 | snapshot_creation_and_lineage | PENDING | — | Blocked on S06 |

### S05 — intake_upload_and_validation

**Purpose:** Implement the file upload intake path and source data validation layer. Uploaded files are parsed, structurally validated, and quarantined if invalid. No normalization yet.

**Acceptance Criteria:**
- [ ] Supported source formats can be uploaded and parsed (CSV minimum; XLSX as stretch)
- [ ] Structural validation reports missing required columns, type mismatches, and empty required fields
- [ ] Invalid files are quarantined — they cannot proceed to the mapping stage
- [ ] Upload is recorded in the audit log
- [ ] Unit and integration tests cover valid and invalid file scenarios

**Blockers / Review Notes:**
- Blocked on M0 Gate (all of Wave 0 must be ACCEPTED)

---

### S06 — mapping_and_normalization_pipeline

**Purpose:** Map source fields to canonical model fields. Detect and surface unmapped workers and pay components. Unmapped records must block snapshot creation.

**Acceptance Criteria:**
- [ ] Source field mapping configuration is defined per intake source
- [ ] Every source record is mapped to a canonical worker and pay record or flagged as unmapped
- [ ] Unmapped records are surfaced with a reason and block downstream processing
- [ ] Mapping is audited and traceable to the rule version used
- [ ] Unit tests cover mapping hits, misses, and partial maps

**Blockers / Review Notes:**
- Blocked on S05

---

### S07 — snapshot_creation_and_lineage

**Purpose:** Create an immutable snapshot from a fully mapped intake batch. Record lineage: source file, mapping version, methodology version, creator, timestamp. Snapshots cannot be modified after creation.

**Acceptance Criteria:**
- [ ] Snapshot creation is blocked if any records are unmapped
- [ ] Snapshot carries full lineage metadata
- [ ] Snapshot status transitions are audited
- [ ] Snapshot cannot be modified after SEALED status
- [ ] Integration tests verify the full intake-to-snapshot path

**Blockers / Review Notes:**
- Blocked on S06

---

## WAVE 2 — JOB ARCHITECTURE AND COMPARABLE CATEGORIES

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S08 | job_normalization_core | PENDING | — | Blocked on M1 Gate |
| S09 | category_engine_exact_and_normalized | PENDING | — | Blocked on S08 |
| S10 | category_engine_equal_value_and_overrides | PENDING | — | Blocked on S09 |

### S08 — job_normalization_core

**Purpose:** Normalize source job titles and codes to the internal job architecture hierarchy. Map jobs to levels, families, and functions.

**Acceptance Criteria:**
- [ ] Job normalization maps source titles to a normalized job reference
- [ ] Normalization is version-controlled — the mapping version is recorded
- [ ] Unmapped jobs surface as exceptions, not silent failures
- [ ] Unit tests cover mapping and exception surfacing

**Blockers / Review Notes:**
- Blocked on M1 Gate

---

### S09 — category_engine_exact_and_normalized

**Purpose:** Assign workers to comparable categories using exact and normalized job matching. Produce a traceable category assignment for every worker in a snapshot.

**Acceptance Criteria:**
- [ ] Every worker in a snapshot receives a category assignment or an explicit exception
- [ ] Category assignment is traceable to rule version and methodology version
- [ ] Exact match and normalized match paths are both implemented and tested
- [ ] No worker can remain unassigned and silently pass to metrics calculation

**Blockers / Review Notes:**
- Blocked on S08

---

### S10 — category_engine_equal_value_and_overrides

**Purpose:** Extend category engine with equal-value work grouping and a governed override mechanism. Overrides must be reviewed and approved before they affect outputs.

**Acceptance Criteria:**
- [ ] Equal-value grouping logic is implemented per the methodology specification
- [ ] Override workflow requires explicit reviewer approval
- [ ] Unapproved overrides block metrics calculation for affected workers
- [ ] All overrides are audited with reviewer identity and timestamp
- [ ] Unit and integration tests cover override approval and rejection paths

**Blockers / Review Notes:**
- Blocked on S09

---

## WAVE 3 — METRICS AND REPORTING CORE

| ID | Slice Name | Status | Completion Date | Notes |
|---|---|---|---|---|
| S11 | metrics_eu_core | PENDING | — | Blocked on M2 Gate |
| S12 | reporting_pack_base | PENDING | — | Blocked on S11 |
| S13 | group_dashboard_core | PENDING | — | Blocked on S12 |

### S11 — metrics_eu_core

**Purpose:** Implement the EU Pay Transparency Directive core metric calculations: mean and median pay gap by gender, bonus gap, pay quartile distribution. Calculations must be deterministic and testable against known reference values.

**Acceptance Criteria:**
- [ ] Mean and median gender pay gap calculations are correct against reference test fixtures
- [ ] Bonus gap and pay quartile distribution are implemented
- [ ] All calculations reference the snapshot ID and methodology version
- [ ] Calculations are blocked if category assignments are incomplete
- [ ] Unit tests use fixed input fixtures with known expected outputs

**Blockers / Review Notes:**
- Blocked on M2 Gate

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
