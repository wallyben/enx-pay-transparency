# PAYROLL_RECONCILIATION_DRY_RUN_v1 — Readiness-Closure (Wave R / R07)
**Artifact ID:** R07-PAYROLL-RECONCILIATION-DRY-RUN-v1  
**Status:** DRAFT (governance-only; mock/test readiness-closure mode)  
**Applies to:** Readiness-Closure evidence-closure only (Wave R).  
**Non-goals (binding):** This artifact does **not** execute reconciliation, does **not** create reconciliation results, does **not** authorize pilot entry/execution, and does **not** constitute product feature work.

---

## 1. Purpose and scope

This document defines the **payroll reconciliation dry-run governance model** for Readiness-Closure item **R07**. It establishes a repeatable, reviewable way to plan and evidence a reconciliation run that proves remuneration truth is anchored to payroll and that the controlled system representation does not silently drift.

**In scope (R07):**
- the **dry-run reconciliation model** (what must be reconciled, at what grains, with what outputs)
- required reconciliation outputs and templates (structure; no populated results)
- required comparison levels and drill-down expectations
- variance handling (classification → disposition → rerun/sign-off expectations)
- explicit relationship to coded exception taxonomy (H04) and confidence gating (H05)
- explicit **mock/test vs real pilot** distinction

**Out of scope (R07):**
- executing reconciliation, calculating totals, or producing real outputs
- implementing reconciliation engines, pipelines, queries, or product features
- authorizing pilot entry or pilot execution

**Binding posture:**
- **Payroll remains the anchor truth for remuneration.**
- **Unmapped or ambiguous remuneration components must not silently pass.**
- Dry-run artifacts are governance scaffolding only; they must not be mistaken for pilot evidence.

---

## 2. Payroll-truth anchoring

Reconciliation is **payroll-anchored** as defined by the Reconciliation Framework v1:

- **Reference truth** for remuneration comparisons is the payroll extract / payroll-controlled reporting for the locked perimeter, unless the SoT Matrix explicitly states otherwise for a specific field.
- Non-payroll remuneration values (e.g., HRIS rates) may be used only as **context** or mismatch signals, not as the authoritative paid-amount truth.
- If payroll evidence is incomplete, inconsistent, or cannot be reconciled for any **pilot-mandatory remuneration field**, the default outcome is **BLOCKER** and must drive fail-closed behavior (by exception coding and confidence triggers).

Perimeter binding (current readiness-closure posture):
- All dry-run artifacts must reference the locked perimeter record:
  - `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)`

---

## 3. Dry-run principles

These principles are binding for R07 dry-run governance:

- **Governance-only; no fabricated results**: templates and obligations may be created; do not invent totals, pass rates, or “example” outcomes that could be mistaken as real evidence.
- **Perimeter-bound and versioned**: every reconciliation output must reference the perimeter and version identifiers (SoT/Methodology/Reconciliation/Mapping).
- **Fail-closed on mandatory truth**: any blocker-level reconciliation condition must block downstream eligibility (metrics/evidence pack export) until resolved or explicitly dispositioned under authority/veto model.
- **Drill-down is mandatory**: any aggregate variance must be traceable to worker-period and component-family contributors and coded exception causes.
- **No silent pass for unmapped/ambiguous**: unmapped earning codes/components and ambiguous allocations must raise coded exceptions and require disposition.
- **Append-only evidence discipline**: results, dispositions, and rerun records are append-only; corrections are new run records, not in-place edits.

---

## 4. Required reconciliation domains

At minimum, a payroll reconciliation dry-run must define obligations for these reconciliation domains (aligning to the H04 framework), each producing report artifacts per domain/level.

### 4.1 Base pay (payroll-anchored)
- Compare base pay totals in the controlled representation vs payroll truth.
- Must support worker-period drill-down and entity/period aggregates.

### 4.2 Variable pay / bonus (payroll-anchored)
- Compare variable/bonus totals by worker-period and in aggregate.
- Must not allow “total matches but component misclassified” to pass silently (component-family reconciliation required).

### 4.3 Included remuneration totals by mapped component family
- Compare totals by **mapped component family** (e.g., BASE_PAY vs VARIABLE_PAY) using the locked mapping version.
- Must detect and surface misclassification even when all-in total is within tolerance.

### 4.4 Worker-period totals
- Compare worker-period **total included remuneration** (sum of in-scope mapped components) vs payroll worker-period truth totals.
- Must support listing variance contributors by component family and by earning-code coverage/mapping exceptions.

### 4.5 Entity/period aggregate totals
- Compare totals at legal-entity + pay-period (and payroll run where relevant) vs payroll control totals.
- Must support drill-down to worker-period variances and mapping/join causes.

### 4.6 Excluded remuneration policy effect (where relevant)
- Where the locked perimeter explicitly excludes off-cycle/retro or component families, dry-run must require explicit evidence that exclusions were applied consistently and their **effect** is measurable.
- Exclusions must be coded and owned; exclusions may not be implied.

---

## 5. Required comparison levels

At minimum, reconciliation planning and outputs must support these comparison levels:

1) **Worker-period**
- Primary drill-down level for remuneration truth.

2) **Component family**
- Base vs variable (and any additional included families per scope) comparisons.

3) **Entity/period aggregate**
- Control totals by legal entity and pay period (and run where relevant).

4) **Run-level summary**
- Single run summary across domains: pass/fail, exception counts, blocker/warning status, rerun requirement, and sign-off readiness.

**Binding rule:** An aggregate PASS is invalid if the underlying worker-period/component-family comparisons contain unresolved blockers or out-of-tolerance variances.

---

## 6. Required input artifacts

R07 does not execute inputs; it defines what inputs must be referenced for a future real run. Dry-run artifacts must reference these inputs as **identifiers/manifest pointers**, not embedded data.

### 6.1 Perimeter and scope references
- `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md` (perimeter reference; MOCK/SYNTHETIC interpretation in readiness-closure)
- Decision log references as applicable (do not fabricate approvals).

### 6.2 Source extract references (by manifest)
Per R04 extract-proof governance, reconciliation must reference extract manifests (or equivalent controlled pointers) for:
- **Payroll earning lines extract** (remuneration truth anchor)
- **Payroll earning code reference extract** (for mapping coverage and evidence)
- **HRIS worker/assignment extract** (identity/context where required)
- **Crosswalk/linkage artifact(s)** (HRIS ↔ payroll identity linkage), if used

### 6.3 Join integrity references
- Join integrity report references per R05 governance (identity joins and any crosswalk integrity), since reconciliation depends on join coverage and uniqueness.

### 6.4 Mapping governance references
- Earning code inventory governance:
  - `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_v1.md`
  - `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_TEMPLATE_v1.md`
- Mapping version lock:
  - `docs/readiness-closure/05_mapping-governance/MAPPING_VERSION_LOCK_v1.md`

**Binding rule:** reconciliation must explicitly reference the **mapping version** used; “latest mapping” is not permitted.

### 6.5 Control artifact version references (mandatory)
Every reconciliation dry-run (and future execution) must reference:
- SoT Matrix version (H02)
- Methodology version (H03), if category/eligibility affects included population
- Reconciliation framework version (H04)
- Exception taxonomy version (H04)
- Confidence model version (H05)

---

## 7. Required output artifacts

R07 defines the **required evidence artifacts** and their minimum structure. Outputs must be generated per reconciliation domain and comparison level in real pilot mode; in readiness-closure, we create the templates and obligations only.

### 7.1 Reconciliation report(s)
- A reconciliation report is produced per:
  - reconciliation domain (Section 4), and
  - comparison level (Section 5), as needed for drill-down.
- Use the template:
  - `docs/readiness-closure/06_reconciliation/PAYROLL_RECONCILIATION_REPORT_TEMPLATE_v1.md`

### 7.2 Run-level summary artifact (governance requirement)
Dry-run governance requires a run-level summary to exist (structure may be implemented later) capturing:
- run identifiers and perimeter binding
- versions referenced (SoT/Methodology/Reconciliation/Mapping/Confidence)
- counts of PASS/FAIL by domain and comparison level
- counts of exceptions by severity (BLOCKER/WARNING)
- whether rerun is required
- sign-off readiness status and any open blockers

### 7.3 Variance drill-down evidence pointers (governance requirement)
For any out-of-tolerance variance (future real run), evidence must support drill-down to:
- worker-period level contributors
- component-family totals
- earning-code coverage/mapping exceptions
- join integrity exceptions when identity/join drives variance

In readiness-closure mode, this is satisfied by explicitly requiring report fields and references; do not include sensitive rows.

### 7.4 Exception linkages (governance requirement)
Every reconciliation variance or non-pass outcome must link to:
- one or more **exception taxonomy codes** (`docs/reconciliation/exception-taxonomy_v1.json`)
- a disposition status (Section 8.3)
- owner + reviewer accountability fields

Note: the exception register structure is owned by **R08** and is out of scope here; R07 only requires that reconciliation outputs are exception-linkable.

---

## 8. Variance classification and disposition expectations

### 8.1 Variance classification (minimum expectations)
Every comparison must classify outcome using explicit fields:
- variance amount (absolute)
- variance percentage (relative)
- tolerance applied (absolute and/or percent)
- threshold result: PASS/FAIL
- blocker/warning result: BLOCKER/WARNING/NONE

### 8.2 Variance causes must be discoverable (dry-run requirement)
Dry-run governance requires that variance evidence supports identifying whether variance is driven by:
- unmapped earning codes (`EARNING_CODE_UNMAPPED`)
- misclassified earning codes (`EARNING_CODE_MISCLASSIFIED`)
- join issues (`JOIN_*` codes; `JOIN_DUPLICATE_KEY`)
- period/run scope issues (`PERIOD_MISMATCH`, `OFFCYCLE_RUN`, `RETRO_PAY_TREATMENT`)
- currency issues (`CURRENCY_MISMATCH`)
- aggregate control total mismatch (`AGGREGATE_CONTROL_TOTAL_MISMATCH`)

**Binding rule:** unmapped or ambiguous remuneration components must not silently pass; they must raise coded exceptions and require disposition.

### 8.3 Disposition statuses (minimum required set)
Reconciliation governance requires these disposition statuses at minimum:
- **OPEN**
- **UNDER_REVIEW**
- **EXPLAINED**
- **ACCEPTED_EXCEPTION**
- **REQUIRES_RERUN**
- **CLOSED**

Disposition meaning (governance semantics):
- **OPEN**: identified; not yet assigned for investigation.
- **UNDER_REVIEW**: owner investigating; evidence gathering in progress.
- **EXPLAINED**: root cause understood and documented; remediation path defined.
- **ACCEPTED_EXCEPTION**: residual variance accepted under authority model with explicit risk record; must reference decision log entry (do not fabricate).
- **REQUIRES_RERUN**: remediation changes inputs/versions; rerun required per framework rerun discipline.
- **CLOSED**: resolved and verified via rerun (or accepted exception with required approvals); evidence references complete.

### 8.4 Rerun expectations
Rerun is required when resolution changes any of:
- join keys/crosswalks,
- earning-code mappings/mapping version,
- inclusion/exclusion rules,
- period allocation rules for off-cycle/retro,
- corrected source extracts.

Rerun discipline must follow the reconciliation framework’s append-only, versioned run identity posture.

---

## 9. Sign-off and review expectations

R07 defines expectations; it does not execute approvals.

### 9.1 Required roles (minimum)
Reconciliation outputs (future real run) must be reviewable and signable by:
- **Payroll Controls Owner** (primary for remuneration truth)
- **HRIS / People Data Owner** (identity/join and HR fields where applicable)
- **Internal Audit / Assurance** (evidence sufficiency + control posture)
- **Legal** (where accepted exceptions affect defensibility)

### 9.2 Sign-off posture (binding)
- No reconciliation outcome may be represented as “passed” unless:
  - all blocker-level variances are resolved/closed, or
  - an explicit exception disposition is approved under the Validation Charter authority model and recorded in a decision record.
- Sign-off must be **explicit**; absence of a reviewer must not be treated as implicit approval.

### 9.3 Confidence gating linkage (expectation)
Reconciliation status must be compatible with the Confidence Model’s fail-closed triggers:
- blocker-level reconciliation exceptions affecting pilot-mandatory remuneration fields imply confidence hard-zero triggers and must block downstream metrics/reporting eligibility.

---

## 10. Mock/test vs real pilot distinction

### 10.1 Mock/test readiness-closure (current mode)
R07 is complete in mock/test governance mode when:
- this dry-run governance document exists and aligns to governing artifacts,
- the reconciliation report template exists,
- required domains, comparison levels, inputs/outputs, variance/disposition model, and sign-off expectations are explicit,
- and outputs are clearly labeled governance-only without fabricated results.

Mock/test mode must:
- reference the **MOCK/SYNTHETIC** perimeter record,
- avoid any implication that reconciliation was executed or passed,
- avoid including any real payroll data rows, extracts, or totals.

### 10.2 Real pilot mode (future; not executed here)
A real pilot reconciliation run (outside readiness-closure) requires:
- real perimeter approval (Gate G1) and privacy/security clearance (Gate G4),
- executed joins and measured join integrity (Gate G7),
- governed mapping version lock (R06 inputs) with real approvals,
- executed reconciliation outputs populated from real extracts,
- exception register creation and dispositions (R08),
- confidence outputs and gate evaluation records (R09),
- and decision log entries for any accepted residual risk.

**Rule (binding):** Nothing in this document alone can be used to assert Validation Charter Gate G8 is passed.

---

## 11. References to governing artifacts

- Authoritative queue and status: `.claude/SLICE_QUEUE.md` (Wave R; R07)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Locked perimeter record (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Source extract proof + manifest template (inputs must be perimeter-bound):  
  - `docs/readiness-closure/03_extract-proof/SOURCE_EXTRACT_PROOF_v1.md`  
  - `docs/readiness-closure/03_extract-proof/EXTRACT_MANIFEST_TEMPLATE_v1.md`
- Join integrity proof + report template (identity prerequisite):  
  - `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_PROOF_v1.md`  
  - `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_REPORT_TEMPLATE_v1.md`
- Mapping governance + mapping version lock (no silent unmapped codes):  
  - `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_v1.md`  
  - `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_TEMPLATE_v1.md`  
  - `docs/readiness-closure/05_mapping-governance/MAPPING_VERSION_LOCK_v1.md`
- Reconciliation framework v1 + exception taxonomy v1:  
  - `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`  
  - `docs/reconciliation/exception-taxonomy_v1.json`
- Confidence model v1 (fail-closed triggers):  
  - `docs/confidence/CONFIDENCE_MODEL_v1.md`

