# Reconciliation Framework v1 — Payroll-Anchored Validation & Exception Taxonomy

**Framework ID:** reconciliation_framework_v1  
**Version:** v1.0.0  
**Status:** DRAFT (binding once adopted per Validation Charter v1 Gate G5)  
**Effective date:** TBD (upon sign-off)  
**Applies to:** Wave H constrained pilot and any pilot run referencing `reconciliation_framework_v1` `v1.0.0`  
**Determinism rule (binding):** Given the same source extracts (or immutable snapshots thereof) and the same versions of SoT Matrix / Methodology / Reconciliation Framework, reconciliation outcomes and exception codes must be reproducible.

---

## 1. Purpose and scope

This document defines the first formal **Reconciliation Framework v1** for the enterprise-hardening phase. Its purpose is to make “truth” provable by defining:

- what must reconcile (domains),
- how reconciliation is performed (methods + comparison levels),
- explicit tolerances and rounding rules,
- a coded exception taxonomy and how it is used,
- explicit blocker vs warning behavior and escalation paths,
- rerun/version discipline,
- gold dataset strategy and test pack structure for audit-grade evidence.

This framework is a governed control artifact, not implicit engine behavior.

### Out of scope (explicit)

H04 defines the reconciliation framework and exception taxonomy only. It does not:

- implement a reconciliation engine,
- implement product workflows or dashboards,
- implement confidence scoring (H05),
- execute a pilot run,
- introduce country-specific reconciliation variants.

---

## 2. Payroll-truth principle

**Payroll is the anchor truth for remuneration** (Validation Charter v1 Section 3.2; SoT Matrix v1 design principle). Therefore:

- When reconciliation compares remuneration fields across systems, **payroll results** (and payroll-controlled mapping versions) are the reference truth unless the SoT Matrix explicitly states otherwise for a specific field.
- Any non-payroll remuneration values (e.g., HRIS salary rates) may be used only as **supporting context** or **mismatch signals**, not as the authoritative paid amount truth.
- If payroll evidence is incomplete, inconsistent, or ambiguous for a pilot-mandatory remuneration field, the default outcome is **BLOCKER** with a coded exception and an explicit disposition path.

---

## 3. Required reconciliation domains

Reconciliation is performed in domains so that failures can be detected from “can we join?” down to “do the paid amounts reconcile?” and then up to “do the aggregates used by metrics reconcile?”.

Minimum required domains for v1:

1) **Join integrity / key coverage**
- HRIS ↔ Payroll worker linkage
- Assignment/position grain integrity (where applicable)
- Uniqueness constraints and duplicate key detection

2) **Headcount and inclusion/exclusion reconciliation**
- In-scope population counts by entity/period
- Explicit inclusion/exclusion reasons (coded) for every excluded worker/earning line

3) **Base pay reconciliation (payroll-anchored)**
- Worker-period totals (base pay components) vs payroll results
- Aggregate control totals (entity/period) vs payroll control totals

4) **Variable pay reconciliation (payroll-anchored)**
- Worker-period totals (variable/bonus components) vs payroll results
- Aggregate control totals vs payroll control totals

5) **Allowances / one-time payments reconciliation (scope-dependent)**
- If allowances/one-time payments are included in pilot scope, they must reconcile at worker/component and aggregate levels
- If excluded, exclusion must be explicit with coded rationale and ownership

6) **Hours/FTE normalization input reconciliation (where relevant)**
- Field-level reconciliation for `fte_fraction` (pilot-mandatory in SoT Matrix v1)
- Any additional hours inputs (if introduced) must reconcile per SoT Matrix tolerances

7) **Metric-input aggregate reconciliation**
- Aggregates used as metric inputs (e.g., counts, sums by gender/category) must reconcile to underlying record sets and to payroll-anchored totals within defined tolerances
- No “metric-only” totals are accepted without traceable roll-up from worker/component-level inputs

---

## 4. Comparison levels

Reconciliation is executed at multiple comparison levels to support drill-down and reproducibility.

Minimum comparison levels (v1):

1) **Schema / file integrity level**
- Structural validity, required columns present, data types plausible
- Extract metadata completeness: source system, extract time, period identifiers, run identifiers

2) **Record-level**
- Key presence, uniqueness, 1:1/1:many cardinality checks at join boundaries
- Referential integrity (no orphans where prohibited)

3) **Component-level**
- Payroll earning line mapping to canonical components
- Earning-code coverage, classification correctness, and exceptions for unmapped/misclassified codes

4) **Entity/period aggregate-level**
- Control totals by legal entity and pay period (and payroll run where relevant)
- Aggregate deltas vs payroll controls within tolerance

5) **Snapshot-level**
- Whole-run completeness, exception counts by severity, and whether blockers exist
- Version integrity (SoT Matrix / Methodology / Reconciliation Framework / mapping versions)

Binding drill-down requirement:

- Every aggregate mismatch must be explainable via drill-down to the underlying worker/component-level records and exception codes.

---

## 5. Reconciliation methods

This section defines **methods** (not implementations) that must be applied within each domain and comparison level.

### 5.1 Join integrity methods

- **Presence checks**: mandatory identifiers must not be null for in-scope records (per SoT Matrix `pilot_mandatory`).
- **Uniqueness checks**: identifiers with uniqueness constraints must have zero duplicates within the defined grain (e.g., `worker_id`, `payroll_worker_id` within provider context).
- **Cardinality checks**: define expected join cardinality per boundary (e.g., worker↔payroll worker expected 1:1 in pilot; assignment grain rules must be explicit).
- **Orphan detection**: detect HRIS-only and payroll-only records; require coded exceptions for each.

### 5.2 Inclusion/exclusion reconciliation methods

- **Eligibility rule evaluation**: inclusion/exclusion rules must be explicit and versioned (Validation Charter G1 + SoT Matrix).
- **Coded exclusion reasons**: every excluded worker/earning line must have a coded reason mapped to the exception taxonomy.
- **Headcount control totals**: compare in-scope headcount to source-system headcount baselines and to payroll paid population baselines (with explicit perimeter definitions).

### 5.3 Remuneration reconciliation methods (payroll-anchored)

- **Component mapping verification**: verify earning codes are mapped to canonical components using an explicit mapping version (SoT Matrix `pay_component_mapping_version`).
- **Worker-period totals**: compare computed worker-period totals per component vs payroll results for the same worker/period/run.
- **Aggregate control totals**: compare summed totals by entity/period (and optionally run) to payroll control totals.
- **Residual analysis**: quantify and categorize residuals (within tolerance vs out-of-tolerance; explainable vs unexplained).

### 5.4 Period, currency, and metadata reconciliation methods

- **Period alignment**: verify pay period boundaries match payroll calendar; detect off-cycle and retro allocations.
- **Currency validation**: verify currency codes are present, valid, and consistent within defined grains.
- **Run metadata integrity**: verify `snapshot_id`, `methodology_version`, and reconciliation framework version references are present and consistent across artifacts.

### 5.5 Manual adjustment and anomaly detection methods

- **Manual adjustment detection**: identify records flagged by payroll as manual adjustments (where available) and require explicit coding and disposition.
- **Outlier checks**: identify extreme deltas or unusual patterns (e.g., unusually high residuals concentrated in a component) and route to payroll controls review with coded exceptions.

---

## 6. Tolerances and rounding rules

Tolerances must be explicit and reproducible. This framework defines default v1 tolerances and the rule that **field-level tolerances in SoT Matrix v1 take precedence** when they exist for the reconciled field.

### 6.1 Precedence rule (binding)

1) If a reconciled field is present in SoT Matrix v1 with a `tolerance` and `failure_severity`, that is the primary tolerance/severity guidance for that field.
2) If SoT Matrix v1 is silent for a reconciliation comparison, this framework’s v1 defaults apply.
3) Any change to tolerances is a controlled change (Section 9).

### 6.2 Rounding rules (v1 defaults)

All monetary comparisons must define:

- **Currency minor-unit rounding**: round monetary values to the currency’s minor unit before comparison (default minor unit = 2 decimals unless the payroll extract specifies otherwise; the payroll extract specification is authoritative for the pilot).
- **Per-worker reconciliation**: compare per worker and per pay period after rounding.
- **Aggregate reconciliation**: aggregate using unrounded line amounts when available, then round the final totals for comparison to payroll control totals, to avoid rounding drift.

### 6.3 Default numeric tolerances (v1; used when SoT Matrix does not provide field-specific tolerance)

These defaults are designed to fail-closed for mandatory remuneration truth, while allowing immaterial rounding noise.

- **Join integrity**:
  - Missing join for an in-scope worker: **0 tolerance** (BLOCKER eligible; default BLOCKER)
  - Duplicate keys in pilot-mandatory identifiers: **0 tolerance** (BLOCKER)
- **Per worker-period remuneration totals** (base pay, variable pay, included allowances):
  - Pass if absolute difference \(\le\) 1 minor unit **OR** relative difference \(\le\) 0.1% (whichever is larger), unless SoT Matrix specifies otherwise.
- **Entity/period aggregate remuneration totals**:
  - Pass if relative difference \(\le\) 0.01% for base pay and \(\le\) 0.05% for variable pay, unless SoT Matrix specifies otherwise.
- **FTE fraction reconciliation**:
  - Pass if absolute difference \(\le\) 0.01 (aligned to SoT Matrix v1 row for `fte_fraction`).

### 6.4 Tolerance exceedance behavior (binding)

If a tolerance is exceeded:

- a coded exception must be raised,
- the exception must be assigned an owner role,
- the exception must be dispositioned (resolved or accepted risk) under the Validation Charter authority model,
- default severity applies unless an explicit severity override is approved and recorded in the decision log.

---

## 7. Exception taxonomy usage

Exceptions must be **coded**, not free-text only. The authoritative taxonomy is:

- `docs/reconciliation/exception-taxonomy_v1.json`

### 7.1 Coding rules (binding)

- Every reconciliation failure that is not a pure “within tolerance” pass must emit **at least one** taxonomy code.
- Exceptions may include free-text notes, but **notes never replace codes**.
- If multiple failures occur, the run must record:
  - the primary exception code (the one that drives severity),
  - any secondary codes (supporting context).

### 7.2 Domain mapping (binding)

Each exception must map to:

- a reconciliation domain (Section 3),
- a comparison level (Section 4),
- a default severity and whether it is blocker-eligible.

### 7.3 Disposition rules (binding)

Every exception must have:

- a required owner role (business control owner, not engineering-only),
- a required resolution path (who investigates, who approves, where it is logged),
- whether a rerun is required for closure (Section 9),
- evidence requirements for closure (Section 12).

---

## 8. Blocker vs warning rules

Blocker/warning must be explicit and reproducible. This section defines the **framework-level default rules**, which are aligned to Validation Charter gates and SoT Matrix severities.

### 8.1 Hard blocker rules (v1; non-bypassable unless exception is explicitly approved)

The following are **BLOCKER** by default and must block downstream outputs (category, metrics, reporting) until resolved or formally dispositioned with explicit approval per Validation Charter:

- **Join integrity failure** for pilot-mandatory worker linkage (e.g., missing HRIS or payroll join for in-scope workers).
- **Duplicate key** in any pilot-mandatory identifier field where uniqueness is required.
- **Unmapped earning code** affecting in-scope remuneration components (silent pay leakage risk).
- **Out-of-tolerance remuneration reconciliation** for pilot-mandatory remuneration fields (base pay, variable pay) as defined in SoT Matrix v1 and/or Section 6.
- **Period mismatch** (pay period boundaries not aligned to payroll calendar) for in-scope runs.
- **Currency mismatch** where currency is required and inconsistencies break comparability of amounts.
- **Missing pilot-mandatory reconciliation metadata**: missing mapping version, missing run identifiers where required for auditability.

### 8.2 Warning rules (v1; allowed only with explicit recorded risk)

Warnings may be allowed to proceed only if:

- the SoT Matrix marks the field as WARNING for pilot use, and
- the Validation Steering Group (VSG) accepts residual risk in a decision log entry (Validation Charter Section 12).

Examples (not exhaustive):

- Optional hours fields (when not pilot-mandatory) that are inconsistent but not used in computations.
- Job family codes that are not used for category assignment in the pilot and are explicitly treated as informational.

### 8.3 Severity override governance (binding)

Severity for a specific exception instance may be overridden only when:

- the taxonomy code is marked `blocker_eligible: true`, and
- the override is approved by the required owner role and acknowledged by Internal Audit/Assurance, and
- the override has an expiry aligned to pilot scope or a defined time window (no perpetual overrides).

---

## 9. Rerun discipline and versioning

Reconciliation failures and their resolutions must not be “fixed” invisibly. Reruns must be versioned and justified.

### 9.1 Run identity (binding)

Every reconciliation execution must reference:

- `snapshot_id` (the immutable input snapshot identifier),
- SoT Matrix version (`source_of_truth_matrix_v1` / `v1`),
- Methodology version (`methodology_v1` / `v1.0.0`),
- Reconciliation framework version (`reconciliation_framework_v1` / `v1.0.0`),
- payroll component mapping version (`pay_component_mapping_version` per SoT Matrix v1),
- extraction metadata identifiers (source extract time, payroll run id, pay period).

### 9.2 Rerun triggers (v1)

Rerun is required when resolution changes any of the following:

- join keys / crosswalks used to join HRIS↔Payroll,
- earning-code mapping or classification,
- inclusion/exclusion rules for population or components,
- period allocation rules for off-cycle or retro pay,
- correction of source extracts (new extract, corrected payroll report).

### 9.3 Rerun documentation (binding)

Each rerun must record:

- a rerun reason (coded; free-text allowed but not sufficient),
- what changed (artifacts/versions),
- the list of exceptions resolved and those remaining,
- whether any residual risk is accepted (and who approved it).

### 9.4 No retroactive edits (binding)

Reconciliation outputs and exception registers are append-only evidence artifacts. Corrections are recorded as:

- a new run record, or
- a superseding exception disposition entry (with references),

not by editing prior evidence in place.

---

## 10. Gold dataset strategy

The pilot must prove reconciliation using a mix of:

- **Gold baseline extracts** (representative “clean” payroll + HRIS extracts with known expected reconciliation outcomes), and
- **Gold exception scenarios** (deliberately constructed cases that trigger each exception code, to validate coding, severity, and rerun discipline).

### 10.1 Gold baseline objectives (v1)

- Demonstrate join integrity at or above the Validation Charter threshold (>=99% for required joins).
- Demonstrate payroll-anchored remuneration reconciliation within tolerance for base pay and variable pay.
- Demonstrate stable mapping versioning and traceability across runs.

### 10.2 Gold exception scenario objectives (v1)

For each exception code in the taxonomy (Section 7), define at least one scenario that:

- triggers the code deterministically,
- produces expected severity behavior (blocker vs warning),
- exercises drill-down from snapshot-level to worker/component-level evidence,
- validates required resolution path and rerun requirements.

---

## 11. Test pack structure

This framework defines the **structure** of reconciliation validation test packs (not code or implementation).

Recommended test pack structure for v1 (logical structure; exact tooling to be defined in implementation slices):

- `gold/`
  - `baseline/`
    - `hris_extract_<id>.<format>`
    - `payroll_extract_<id>.<format>`
    - `reward_extract_<id>.<format>` (if applicable)
    - `expected/`
      - `expected_join_integrity.json`
      - `expected_control_totals.json`
      - `expected_exception_register.json` (empty or minimal for baseline)
  - `exceptions/`
    - `<exception_code>/`
      - `inputs/` (minimal extracts / deltas)
      - `expected/expected_exception_register.json`
      - `expected/expected_blocker_status.json`

Binding requirements for v1 test packs:

- Expected outputs must include **coded exceptions** (not prose-only assertions).
- Each scenario must specify the reconciliation domain and comparison level it targets.
- Each scenario must declare whether a rerun is required for closure.

---

## 12. Evidence requirements

Reconciliation evidence must be audit-reviewable and linked to governance artifacts.

Minimum evidence outputs required for Gate G5/G8 support:

- **Join integrity report**:
  - join rates per boundary (HRIS↔Payroll),
  - duplicate/orphan counts,
  - list of exception codes raised and counts.
- **Remuneration reconciliation report**:
  - per worker-period totals comparison for base pay and variable pay,
  - component-level residuals by earning code,
  - aggregate control totals by entity/period (and run where applicable),
  - within-tolerance vs out-of-tolerance classification and associated codes.
- **Exception register** (coded, owned, dispositioned):
  - code, severity, owner role, resolution path state, evidence links, rerun required flag.
- **Version manifest**:
  - snapshot id, extract metadata, mapping version(s), SoT Matrix version, Methodology version, Reconciliation Framework version.

Evidence must be sufficient to support Validation Charter Gates:

- **G5** (framework ready): artifacts exist and owners are named (by role) for each domain.
- **G8** (reconciliation pass): reports show tolerances met and no unresolved blockers remain.

---

## 13. References to related control artifacts

Binding references:

- Validation Charter v1: `docs/validation/VALIDATION_CHARTER_v1.md` (G5, G7, G8; veto/authority model)
- Enterprise Hardening Redirect: `docs/validation/REDIRECT_DECISION.md` (payroll truth anchor)
- Source-of-Truth Matrix v1:
  - `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md`
  - `docs/data-governance/source-of-truth-matrix_v1.csv`
  - `docs/data-governance/source-of-truth-matrix_v1.json`
- Methodology v1:
  - `docs/methodology/METHODOLOGY_v1.md`
  - `docs/methodology/methodology_v1.json`
- Exception taxonomy v1 (this slice):
  - `docs/reconciliation/exception-taxonomy_v1.json`
