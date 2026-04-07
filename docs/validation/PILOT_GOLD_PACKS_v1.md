# PILOT_GOLD_PACKS_v1 — Governed Gold Dataset Packs + Validation Test Packs (Design)
**Document ID:** PILOT_GOLD_PACKS_v1  
**Status:** DRAFT (design artifact; becomes binding once adopted under Validation Charter Gate G1/G7)  
**Applies to:** Wave H slice H06 (`pilot_gold_packs_and_validation_tests`)  
**Non-goal (binding):** This document does **not** execute a pilot, create pipelines, implement schemas/contracts, or add product code. It defines **repeatable gold packs + validation test packs** and their expected outcomes/evidence requirements.

---

## 1. Purpose and scope

This artifact defines the **first governed pilot gold-pack** and **validation test-pack** design used to prove (before pilot execution):
- **Join integrity / key coverage** across HRIS ↔ Payroll (and Reward/job-architecture where applicable)
- **Payroll-anchored reconciliation** outcomes and coded exceptions
- **Methodology defensibility** and category/equal-value governance paths (challenge + overrides)
- **Confidence fail-closed** gating and run-level breach-rate invalidation
- **Worker-level explainability** (trace completeness from sources → derivations → versions → decisions → outputs)

**In scope (H06):**
- gold dataset pack structure (baseline + exception scenarios)
- validation test pack structure, categories, scenario naming, and expected outcomes model
- explicit mapping to:
  - Validation Charter v1 (`docs/validation/VALIDATION_CHARTER_v1.md`)
  - SoT Matrix v1 (`docs/data-governance/source-of-truth-matrix_v1.json`)
  - Methodology v1 (`docs/methodology/methodology_v1.json`)
  - Reconciliation Framework v1 + taxonomy (`docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`, `docs/reconciliation/exception-taxonomy_v1.json`)
  - Confidence Model v1 (`docs/confidence/confidence-model_v1.json`)

**Explicitly out of scope (binding):**
- pilot execution (data extraction, runs, remediation, decisions, operational playbooks)
- any production data pipelines or “gold pack generator” tooling
- product features, dashboards, exports, UI flows, or workflow automation
- creation/implementation of contracts/schemas and canonical models

---

## 2. Gold dataset strategy

### 2.1 Why gold packs exist in Wave H
Gold packs are the **repeatable, versioned evidence substrate** for the hardening redirect. They exist to prove enterprise failure modes in a deterministic way before expanding product surface area (Redirect Decision; Validation Charter gates G7–G10).

### 2.2 Gold pack types (v1)
Gold data is organized into two complementary pack types:

- **Gold baseline pack**: representative “clean” data where joins reconcile and payroll totals are within tolerance. Purpose: prove the platform can produce valid outputs under expected conditions.
- **Gold exception packs**: deliberately curated cases that trigger real enterprise failure modes (duplicates, missing joins, off-cycle, retro, unmapped earning codes, override governance, methodology mismatch, confidence fail-closed). Purpose: prove controls, gates, coded exceptions, and evidence drill-down.

### 2.3 Gold pack composition (logical structure; not an implementation)
Each gold pack is a **bundle** comprised of:

- **Inputs**
  - HRIS extract (Workday/HRIS) covering pilot-mandatory worker/job fields (SoT Matrix v1)
  - Payroll extract (payroll truth anchor) covering earning lines, earning codes, pay periods, run identifiers, off-cycle/retro flags (SoT Matrix v1)
  - Reward / job architecture reference extract(s) where used by methodology (e.g., job level mapping)
  - Controlled reference artifacts used by the run (by version reference only in v1):
    - earning-code → pay component mapping version (`pay_component_mapping_version`)
    - methodology version (`methodology_version`)
    - reconciliation framework version
    - confidence model version

- **Expected outputs (design-time expectations)**
  - expected join integrity outcomes (join rates, orphan/duplicate counts)
  - expected reconciliation outcomes (within tolerance vs coded exceptions)
  - expected confidence outcomes (field/record status + fail-closed triggers)
  - expected category/methodology outcomes (review required, override pending/approved behavior, methodology mismatch behavior)
  - expected export/run gating outcomes (blocked vs allowed; run invalidation via breach thresholds)

- **Evidence bundle requirements**
  - required evidence artifacts per scenario (Section 8)
  - required references to versions and identifiers (snapshot/run identifiers, mapping versions)

### 2.4 Minimality rule (v1)
Gold packs must be **as small as possible** while still:
- triggering the intended failure mode deterministically,
- enabling drill-down to worker/component-level evidence,
- supporting repeatable reruns and version comparisons.

---

## 3. Dataset protection and handling rules

Gold packs may contain worker-level pay and identity data (often **SENSITIVE_PII** per SoT Matrix v1). Therefore the following handling rules are binding for v1:

- **Purpose limitation**: gold packs exist for validation + compliance evidence only (Validation Charter Section 8; SoT Matrix `legal_or_usage_notes`).
- **Minimization**: include only fields necessary to satisfy the scenario and evidence requirements. Do not include “nice-to-have” columns.
- **Access control**: restrict access to roles required by Validation Charter (Reward, Payroll Controls, HRIS, Legal, Privacy, Security, Internal Audit, Engineering on need-to-know basis).
- **Masking discipline**: where gold packs are shared for broader review, amounts and identifiers must be masked unless reviewer role requires raw access.
- **Retention & deletion**: follow SoT Matrix `retention_requirement` per field; raw extracts must be deleted per pilot policy while retaining immutable lineage references and evidence bundles required for audit.
- **No uncontrolled copies**: gold packs must not be emailed or stored in unapproved locations; storage classification must match the highest-sensitivity field in the pack.

---

## 4. Test pack design principles

These principles are binding for v1 test-pack design:

1) **Enterprise failure modes first**: scenarios must cover real, high-probability failure modes (not only happy paths).  
2) **Explicit control outcomes**: every scenario must map to an expected control outcome across join, reconciliation, confidence gating, methodology governance, and export/run gating.  
3) **Payroll-anchored truth**: remuneration reconciliation expectations are anchored to payroll (Reconciliation Framework v1).  
4) **Fail-closed posture**: missing pilot-mandatory truth, ambiguous joins, blocker reconciliation, methodology mismatch, and pending/expired overrides must block downstream use (Confidence Model v1 FC rules; Validation Charter fail-closed).  
5) **Explainability is testable**: worker-level explainability must be explicitly validated as a first-class outcome, not implied.  
6) **Reproducible reruns**: rerun identity, version manifests, and append-only evidence are required; no in-place edits to evidence artifacts (Validation Charter + Reconciliation + Confidence).  

---

## 5. Required test-pack categories

The pilot validation test pack must include, at minimum, categories below. Each category is validated using one or more named scenarios (Section 6):

- **Join integrity / key coverage**
- **Clean payroll happy path**
- **Off-cycle / retro / adjustment handling**
- **Unmapped or misclassified earning code**
- **Remuneration reconciliation blocker**
- **Methodology / category challenge path**
- **Override governance cases**
- **Low-confidence / fail-closed cases**
- **Worker-level explainability samples**
- **Export/report gating cases**

---

## 6. Named validation scenarios (v1 minimum set)

This section defines the minimum named scenarios required for the first pilot validation set. The authoritative machine-readable catalog lives in:
- `docs/validation/pilot-validation-test-packs_v1.json`

Each scenario must declare:
- inputs and source conditions (at a semantic level),
- expected join/reconciliation/confidence/methodology outcomes,
- expected export/run gate outcomes,
- expected reconciliation exception codes (where applicable),
- evidence required.

### 6.1 Minimum named scenarios (must exist)
The v1 pack must include at least the following named scenarios (these scenario IDs and titles must appear in the JSON catalog):

1. Clean matched payroll run  
2. Missing payroll join  
3. Duplicate join key  
4. Unmapped earning code  
5. Earning code misclassification  
6. Retro pay present  
7. Off-cycle payment present  
8. Missing mandatory gender  
9. Ambiguous job evidence  
10. Pending override blocks downstream truth  
11. Approved override with evidence  
12. Methodology version mismatch  
13. Blocker reconciliation causes export block  
14. Breach-rate threshold invalidates metrics run  
15. Worker-level explainability trace complete  

---

## 7. Expected outcomes model

### 7.1 Outcome axes (v1)
Every scenario must produce an expected outcome across **five** axes:

- **Join outcome**: PASS / WARNING / BLOCKER  
  - Examples of blocker join outcomes: missing join, duplicate key/cardinality breach.

- **Reconciliation outcome**: PASS_WITHIN_TOLERANCE / WARNING_EXCEPTION / BLOCKER_EXCEPTION  
  - If not pass: must cite exception taxonomy code(s) from `exception-taxonomy_v1.json`.

- **Confidence outcome**: HIGH/MEDIUM/LOW/VERY_LOW/ZERO + fail-closed trigger(s) where applicable  
  - Must reference confidence reason codes and FC triggers defined in `docs/confidence/confidence-model_v1.json`.

- **Category/methodology outcome**: PASS / REVIEW_REQUIRED / BLOCKED  
  - Includes override governance behavior per Methodology v1.

- **Export/run gate outcome**: ALLOW / BLOCK_EXPORT / BLOCK_RUN_VALIDITY  
  - “BLOCK_RUN_VALIDITY” is used when run-level breach thresholds (FC-R1) invalidate the metrics run.

### 7.2 Blocker expectation rules (v1)
If any of the following occurs, scenario expectation must be **blocker_expected=true**:
- ambiguous join / duplicate key (JOIN_DUPLICATE_KEY; Confidence FC-F2)
- missing pilot-mandatory field (Confidence FC-F1; e.g., missing gender)
- reconciliation blocker affecting mandatory remuneration truth (e.g., EARNING_CODE_UNMAPPED; AGGREGATE_CONTROL_TOTAL_MISMATCH; Confidence FC-F3)
- methodology version missing/mismatch (Confidence FC-F4)
- pending/expired override affecting category truth (Confidence FC-F5)
- run-level breach thresholds exceeded (Confidence FC-R1)

---

## 8. Evidence requirements

Evidence must be audit-reviewable, versioned, and sufficient to support Validation Charter gates (especially G7–G9). For each scenario, the test pack must require (as applicable):

- **Version manifest evidence**
  - snapshot/run identifier(s)
  - SoT Matrix id/version (`source_of_truth_matrix_v1` / `v1`)
  - Methodology id/version (`methodology_v1` / `v1.0.0`)
  - Reconciliation framework id/version (`reconciliation_framework_v1` / `v1.0.0`)
  - Confidence model id/version (`confidence_model_v1` / `v1.0.0`)
  - payroll mapping version (`pay_component_mapping_version`)

- **Join integrity report evidence** (Reconciliation Framework Section 12)
  - join rates by boundary (HRIS↔Payroll)
  - orphan/duplicate counts
  - affected identifiers list (restricted access)

- **Reconciliation report evidence**
  - worker-period totals for base pay and variable pay vs payroll controls
  - component-level residuals by earning code
  - aggregate control totals by entity/period/run
  - within-tolerance vs out-of-tolerance classification with taxonomy codes

- **Exception register evidence** (coded; append-only)
  - taxonomy code(s), severity, owner role, resolution/disposition state, rerun-required flag, evidence links

- **Confidence evidence**
  - field-level and record-level confidence outputs with reason codes
  - fail-closed trigger evaluation record (FC-F* / FC-R1)
  - run-level breach-rate calculations (blocked_record_rate, low_confidence_record_rate)

- **Methodology / override governance evidence**
  - evidence bundle references per Methodology v1 (tier + minimum evidence)
  - override records (requested_by, approved_by, approved_at, expiry_date) and SoD checks
  - challenge/decision records where relevant

- **Worker-level explainability walkthrough pack** (Validation Charter Gate G9; SoT Matrix `explainability_trace_reference`)
  - for a sampled worker: trace source extracts → identifiers → derivations → versions → decisions/overrides → output values
  - must include links to join and reconciliation artifacts and confidence reasons

---

## 9. Rerun and versioning discipline

Reruns are mandatory when resolution changes join keys/crosswalks, earning-code mapping, inclusion/exclusion rules, period allocation (off-cycle/retro), or source extracts (Reconciliation Framework Section 9).

Binding requirements:
- **append-only evidence**: do not edit prior evidence in place; supersede via new run records
- **stable run identity**: each rerun must produce a new run record and link to what changed and which exceptions were resolved
- **version manifest required**: each run must include full version manifest references (Section 8)

---

## 10. Pilot readiness usage

This design is used to establish a concrete, repeatable **pilot readiness validation set**:
- Pack execution (future) produces the evidence required to satisfy Validation Charter gates:
  - **G7**: extracts + join integrity evidence
  - **G8**: payroll-anchored reconciliation pass evidence
  - **G9**: explainability + reproducibility evidence
- The validation set is also used to prove fail-closed controls and non-bypassable gates before any downstream expansion resumes (Redirect Decision + PROJECT_PLAN “non-bypassable gates”).

**Important:** H06 only defines the packs and expected outcomes. The execution engine, pipelines, and operational runbooks begin in later implementation slices (not authorized during docs-only Wave H design work).

---

## 11. References to related control artifacts

Binding references:
- `docs/validation/REDIRECT_DECISION.md`
- `docs/validation/VALIDATION_CHARTER_v1.md`
- `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md`
- `docs/data-governance/source-of-truth-matrix_v1.csv`
- `docs/data-governance/source-of-truth-matrix_v1.json`
- `docs/methodology/METHODOLOGY_v1.md`
- `docs/methodology/methodology_v1.json`
- `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`
- `docs/reconciliation/exception-taxonomy_v1.json`
- `docs/confidence/CONFIDENCE_MODEL_v1.md`
- `docs/confidence/confidence-model_v1.json`

