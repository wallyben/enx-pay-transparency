# PROJECT_PLAN.md
# Euronext Pay Transparency Control Tower
# Controlling Build Document — v1.0

---

## 1. MISSION

Build an internal, multi-country pay transparency compliance platform for Euronext.

The platform must:
- Normalize worker, job, and pay data across multiple countries into a canonical model
- Classify workers into legally defensible comparable categories
- Calculate pay transparency metrics from immutable, audited snapshots
- Produce audit-ready evidence packs and management attestation packs
- Manage worker information request workflows end to end
- Track remediation actions and governance decisions
- Support a shared core with structured, country-specific overlays

This is a compliance control tower. It is not a compensation planning suite, not a benchmarking product, not a general HR system, and not an analytics playground. Every build decision must be evaluated against compliance accuracy and auditability, not feature richness.

---

## 2. COUNTRIES IN SCOPE

| Country | Overlay Pack |
|---|---|
| Belgium | S23_country_pack_belgium |
| Denmark | S24_country_pack_denmark |
| France | S25_country_pack_france |
| Germany | S26_country_pack_germany |
| Ireland | S20_country_pack_ireland |
| Italy | S27_country_pack_italy |
| Netherlands | S28_country_pack_netherlands |
| Norway | S22_country_pack_norway |
| Portugal | S29_country_pack_portugal |
| Spain | S30_country_pack_spain |
| Sweden | S31_country_pack_sweden |
| United Kingdom | S21_country_pack_uk |

Country-specific legal thresholds, metric definitions, reporting formats, and classification rules belong exclusively in country overlay packs. They must never be hardcoded into any shared core package.

---

## 3. SUCCESS DEFINITION

The platform is successful when it can:

1. Ingest worker and pay data from a supported source format, validate and normalize it, and produce an immutable snapshot with full lineage
2. Classify every worker in a snapshot into a comparable category, with every classification traceable to rule version and methodology version
3. Calculate the required pay gap metrics for each country in scope from the snapshot, with outputs reproducible from the same inputs
4. Generate an audit evidence pack that can be submitted to a regulator or reviewed by an external auditor without supplementary explanation
5. Allow a worker to submit an information request, receive a response within the statutory window, and have the full exchange logged
6. Register, track, and close remediation issues against the evidence record
7. Block any downstream output when required inputs are incomplete, unmapped, or unreviewed

---

## 4. DELIVERY PRINCIPLES

These are non-negotiable. Any future work that conflicts with these principles must be flagged and resolved before continuing.

### 4.1 Control Before Convenience
Correctness, traceability, and governance take precedence over UI polish or developer ergonomics. A plain, correct output is better than a polished, incorrect one.

### 4.2 Deterministic First
No AI-dependent logic in core calculations, core categorization, or compliance outputs. AI may assist with summarization or drafting in ancillary tools only. Metrics, classifications, and evidence outputs must be 100% deterministic given the same inputs.

### 4.3 Vertical Slice Delivery
Each slice must be small enough to complete, test, and review safely. No slice may depend on a future slice being partially implemented. No slice may start before its predecessor is accepted.

### 4.4 Shared Core, Local Overlays
All country-specific logic — thresholds, metric formulas, classification rules, statutory deadlines, reporting templates — must live in the country overlay packs under `packages/country-packs/`. It must never be scattered through shared core packages.

### 4.5 Non-Bypassable Gates
The following conditions must block downstream outputs when they are unresolved:
- Unmapped workers in a snapshot
- Missing pay data for a required field
- Unapproved classification exceptions
- Unreviewed methodology changes
- Incomplete evidence pack items

### 4.6 Traceability
Every material output must carry: source data reference, snapshot ID, methodology version, rule pack version, reviewer identity, and timestamp. This metadata must be stored, not just logged.

### 4.7 No Drift
Every piece of work must map to a named slice, a milestone, and a set of acceptance criteria. Work that cannot be mapped is out of scope.

---

## 5. MODULAR MONOREPO STRATEGY

The repo is a modular monorepo. All code lives here. No external repos for application packages.

### 5.1 Top-Level Structure (Target State)

```
apps/
  api/          — REST/tRPC API server
  web/          — Internal web application
  worker/       — Background job processor

packages/
  contracts/          — Shared TypeScript types, enums, Zod schemas
  auth/               — Authentication and RBAC
  audit/              — Audit log write, query, and export
  security/           — Encryption, token handling, PII controls
  country-packs/      — Per-country overlay modules
  canonical-model/    — Canonical worker, job, pay, and period data models
  intake-engine/      — Upload, validation, and source mapping pipeline
  job-architecture/   — Job normalization and hierarchy management
  category-engine/    — Comparable category assignment and overrides
  metrics-engine/     — Pay gap and transparency metric calculations
  reporting-engine/   — Evidence pack, management attestation, export
  casework-engine/    — Worker information request workflows
  remediation-engine/ — Remediation issue register and closure tracking
  policy-registry/    — Rule packs, methodology versions, approval records
  recruiting-controls/— Job posting compliance checks
  shared-ui/          — Reusable UI components (internal, not public)
  test-fixtures/      — Shared test data and factories

docs/
  architecture/   — System and component diagrams
  controls/       — Control narratives and gap analysis
  legal-matrix/   — Country-by-country legal requirement matrix
  methodology/    — Pay gap methodology documentation
  runbooks/       — Operational runbooks
  adr/            — Architecture Decision Records
  country-guides/ — Country-specific implementation notes

infra/
  docker/         — Container definitions
  scripts/        — Dev and operational scripts
  migrations/     — Database schema migrations

tests/
  integration/    — Cross-package integration tests
  e2e/            — End-to-end scenarios
```

Note: Only the `.claude/` directory and this governance layer exist at the start. The above structure is the target. It is created slice by slice.

### 5.2 Package Boundary Rules

- `apps/` packages may import from `packages/` — never the reverse
- `packages/` may import from `packages/contracts/` and `packages/canonical-model/` only at the shared base level
- `packages/country-packs/` import from core packages — core packages must never import from country packs
- `packages/auth/` and `packages/audit/` are cross-cutting — any package may depend on them
- `packages/shared-ui/` is consumed by `apps/web/` only
- Circular dependencies between packages are forbidden

---

## 6. COUNTRY PACK STRATEGY

Each country pack is a self-contained module under `packages/country-packs/<country>/`.

Each country pack must export:
- Statutory metric definitions (which metrics are required, thresholds, formulas where they differ from EU core)
- Classification rules and any country-specific override logic
- Reporting templates (structure and required fields)
- Statutory deadlines and reporting periods
- Casework response window configuration
- Any local legal references (for documentation purposes)

Country packs may not:
- Modify or monkey-patch core engine behavior
- Bypass shared validation or gate logic
- Introduce data models that are not extensions of the canonical model

Country packs are built in Wave 6. The shared core (Waves 0–5) must be country-agnostic. During Waves 0–5, Ireland is used as the reference country for integration testing where a specific country is required. This is a testing convenience only — Ireland is not treated as the default country in any core logic.

---

## 7. SLICE MODEL

The build is organized into 35 slices across 7 waves. A slice is the smallest unit of deployable, testable work.

Each slice has:
- A unique ID and name
- A single clear purpose
- Owned files and directories
- Acceptance criteria
- Required tests
- Evidence of delivery

No slice may start until the previous slice in its wave dependency chain is accepted. Cross-wave dependencies are tracked explicitly in `SLICE_QUEUE.md`.

Full slice list and status: see `SLICE_QUEUE.md`.

---

## 8. MILESTONE PLAN

| Milestone | Waves | Slices | Description |
|---|---|---|---|
| M0 — Foundation Complete | Wave 0 | S01–S04 | Repo, contracts, canonical model, audit/security baseline |
| M1 — Intake Complete | Wave 1 | S05–S07 | Upload, validation, normalization, snapshot creation |
| M2 — Classification Complete | Wave 2 | S08–S10 | Job normalization, comparable categories, overrides |
| M3 — Metrics and Reporting Complete | Wave 3 | S11–S13 | EU core metrics, evidence packs, group dashboard |
| M4 — Casework and Remediation Complete | Wave 4 | S14–S17 | Information requests, remediation register |
| M5 — Policy and Recruiting Complete | Wave 5 | S18–S19 | Policy registry, recruiting controls |
| M6 — Country Packs Complete | Wave 6 | S20–S31 | All 12 country overlays |
| M7 — Hardened and Released | Wave 7 | S32–S35 | Evidence viewer, admin, security hardening, runbooks |

### Milestone Go/No-Go Requirements

Before advancing from one milestone to the next:
- All slices in the wave are in ACCEPTED status
- All tests pass in CI
- ADRs for any architectural decisions made during the wave are filed and approved
- Any open blockers are resolved or formally deferred with documented rationale

---

## 9. ANTI-DRIFT OPERATING SYSTEM

Drift is the accumulation of work that was not planned, not tested, not accepted, or not traceable. Drift makes compliance systems unreliable.

### 9.1 Drift Prevention Rules

1. Every file created or modified must belong to the active slice's owned scope
2. No package, directory, or file may be created speculatively for a future slice
3. If a dependency is missing from a current slice, stop and evaluate whether the dependency should have been part of a preceding slice. If yes, raise it as a blocker. Do not silently implement it in the current slice.
4. No acceptance criteria may be skipped or marked as "will fix later"
5. No slice may be marked ACCEPTED unless all its tests pass and all its acceptance criteria are met

### 9.2 Slice Scope Enforcement

Each slice definition in `SLICE_QUEUE.md` lists owned files. No changes may be made to files outside that list during the slice, except for:
- Bug fixes in a prior slice's files where the bug is directly blocking the current slice (must be documented)
- Updates to `SLICE_QUEUE.md` itself (status updates, blocker notes)

### 9.3 Country Logic Quarantine

Until Wave 6: any code that is specific to one country, references a country by name in logic (not in a test fixture label or documentation string), or imports from a country pack is flagged as a drift violation and must be refactored before the slice is accepted.

---

## 10. DEFINITION OF DONE — PER SLICE

A slice is DONE when all of the following are true:

- [ ] All files listed in the slice's "Owned Files" are created or modified as specified
- [ ] All acceptance criteria in `SLICE_QUEUE.md` are met
- [ ] All unit tests for the slice pass
- [ ] Integration tests (where required by the slice) pass
- [ ] No TypeScript errors (for TS packages) or equivalent language-level errors
- [ ] No ESLint errors in owned files (for JS/TS)
- [ ] No country-specific logic introduced into shared core packages
- [ ] No files outside the owned scope modified (except documented exceptions)
- [ ] ADR filed for any architectural decision made during the slice
- [ ] `SLICE_QUEUE.md` updated: slice status set to ACCEPTED, completion date recorded

---

## 11. ADR REQUIREMENTS

An Architecture Decision Record (ADR) is required for any decision that:
- Introduces a new package or changes a package boundary
- Changes the canonical data model
- Changes how audit records are structured or stored
- Chooses a technology (DB engine, auth library, job queue, etc.)
- Departs from a stated delivery principle
- Establishes a pattern that other slices will follow

ADRs live in `docs/adr/`. Format: `ADR-NNN-short-title.md`. Each ADR records: context, decision, consequences, status.

ADRs do not require external approval to be filed, but a slice that makes an ADR-worthy decision must file the ADR before the slice is marked ACCEPTED.

---

## 12. ROLLOUT APPROACH

This platform is internal. It is not a SaaS product. Rollout is phased by country after M3 (Metrics and Reporting) is complete:

1. Internal pilot with one country (Ireland) using synthetic data — after M3
2. Internal pilot with Ireland using real anonymized data — after M6 (Ireland pack)
3. Controlled rollout to remaining countries — one at a time, following country pack acceptance
4. Full production — after M7

No country goes live before its country pack is in ACCEPTED status and a country-specific evidence review has been completed.

---

## 13. IMMEDIATE NEXT STEPS

1. Start S01_foundation_repo_bootstrap per the slice definition in `SLICE_QUEUE.md`
2. S01 scope: monorepo tooling, workspace configuration, CI baseline, lint/test config, Docker dev environment skeleton
3. Do not start S02 until S01 is in ACCEPTED status
4. Do not create application code, DB schema, or API routes during S01

Current active slice: **S01_foundation_repo_bootstrap**
Current milestone: **M0 — Foundation**
