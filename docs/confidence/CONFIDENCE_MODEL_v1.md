# Confidence Model v1 — Field-Level + Record-Level Confidence and Fail-Closed Gates

**Confidence model ID:** confidence_model_v1  
**Version:** v1.0.0  
**Status:** DRAFT (binding once adopted per Validation Charter v1 Gate G6)  
**Effective date:** TBD (upon sign-off)  
**Applies to:** Wave H constrained enterprise pilot and any pilot run referencing `confidence_model_v1` `v1.0.0`  
**Determinism rule (binding):** Given the same inputs, the same versions of related control artifacts, and the same confidence model version, field-level and record-level confidence scores, reason codes, and gate outcomes must be reproducible.

---

## 1. Purpose and scope

This document defines the first formal **confidence model** and **fail-closed gating design** for the enterprise-hardening phase (Wave H). It enables the pilot to:

- measure **field-level confidence** and **record-level confidence**,
- propagate uncertainty deterministically (no smoothing over ambiguity),
- produce **explainable confidence outcomes** (why confidence is low, not just that it is low),
- **fail-closed** (block downstream category/metrics/reporting outputs) when confidence is insufficient for pilot-mandatory truth.

**In scope (H05):**
- field-level confidence scoring model (inputs, scoring logic, reason codes)
- record-level confidence aggregation model
- propagation rules (how uncertainty reduces or zeros confidence)
- fail-closed triggers
- downstream blocking rules (category eligibility, metrics eligibility, reporting/evidence-pack export eligibility)
- explicit thresholds and statuses
- reviewer visibility requirements
- evidence/audit requirements
- references to related control artifacts (Validation Charter, SoT Matrix, Methodology v1, Reconciliation Framework)

**Out of scope (explicit):**
- no confidence engine implementation
- no product/application code
- no schema/contract implementation
- no dashboards or reporting features
- no pilot execution steps or test packs (**H06** owns pilot gold packs + validation tests)
- no country-specific confidence variants (country overlays are later; Wave H is country-agnostic)

### 1.1 Where H05 stops and H06 begins (binding boundary)

- **H05 stops** at defining the confidence control model, reason codes, propagation rules, and deterministic fail-closed gating design (and the machine-readable artifact that later implementation must follow).
- **H06 begins** with defining **pilot gold datasets** and **validation test packs** that exercise this confidence model (including expected confidence outcomes and blocker behavior) and reconciliation/methodology gates in realistic scenarios.

### 1.2 v1 assumptions (explicit; may be revised only via change control)

For v1, this model assumes:
- a **0–100** confidence score scale for fields and records (integer), where 0 means “not usable” and 100 means “fully trusted given available evidence”
- the pilot uses the SoT Matrix v1 **pilot-mandatory** marking and its **failure severity** to drive blocking posture
- reconciliation exceptions use the H04 taxonomy codes and severity defaults; blocker-level reconciliation outcomes **materially reduce or zero** confidence
- no imputation: missing pilot-mandatory data is **not** inferred or filled; confidence is reduced/zeroed instead
- overrides (methodology/category) are governed per Methodology v1; **pending/expired/unapproved** overrides are treated as confidence-reducing and gate-triggering
- “confidence” is not “accuracy probability”; it is a **compliance control signal** that enforces whether downstream use is allowed

---

## 2. Confidence design principles

These principles are binding for v1:

1) **Confidence is a control, not a cosmetic score.** Confidence must drive gating decisions and downstream eligibility; low confidence must block outputs where required.  
2) **Fail-closed for pilot-mandatory truth.** Any pilot-mandatory field with insufficient confidence must block downstream use (Validation Charter v1 Section 5.3, Gate G6; PROJECT_PLAN “non-bypassable gates”).  
3) **Reconciliation is material.** Blocker-level reconciliation failures (H04) must reduce confidence materially and may zero confidence for affected fields/records.  
4) **No ambiguity smoothing.** Ambiguous joins, duplicates, and cardinality breaches must not be “averaged out” or papered over. They must be visible and must gate.  
5) **Overrides are not truth.** Pending/expired/unapproved overrides (Methodology v1) must reduce confidence and trigger gates; only approved, in-date overrides may restore eligibility (subject to other gates).  
6) **Reproducible and versioned.** Confidence outcomes must be reproducible and tied to versions of SoT Matrix, Methodology, Reconciliation Framework, and Confidence Model.  
7) **Explainable.** Every field/record confidence outcome must carry **reason codes** that identify which signals reduced confidence and which gates were triggered.

---

## 3. Field-level confidence model

### 3.1 Field confidence score definition

Each canonical field for a record (e.g., a worker-period remuneration field) receives:
- **Field confidence score** \(C_f\) as an integer in **[0, 100]**
- **Field confidence status** (Section 10)
- **Field confidence reason codes** (Section 6) derived from evaluated input signals (Section 5)

Field confidence is computed deterministically as:

\[
C_f = clamp_{0..100}\left(\left\lfloor C_{base} \times M_{evidence} \times M_{freshness} \times M_{recon} \times M_{join} \times M_{override} \right\rceil\right)
\]

Where:
- \(C_{base}\) is the baseline confidence derived from **system-of-record strength** (SoT Matrix v1)
- Multipliers \(M_*\) are in **[0, 1]** and enforce fail-closed behavior when required
- Any **hard-zero** condition sets \(C_f := 0\) immediately (Section 8)

### 3.2 Baseline score (source-of-record strength)

Baseline scores by declared SoR posture (from SoT Matrix v1 row; by field):

- **SoR = Payroll (remuneration truth anchor)**: \(C_{base} = 95\)  
- **SoR = Workday/HRIS (worker/job truth anchor)**: \(C_{base} = 90\)  
- **SoR = Reward / governed reference artifact**: \(C_{base} = 85\)  
- **SoR = Derived (documented derivation + precedence in SoT Matrix)**: \(C_{base} = 80\)  
- **SoR ambiguous / not declared**: \(C_{base} = 40\) and add reason code `SOT_SOR_UNDECLARED` (blocking for pilot-mandatory fields)

If SoT Matrix declares a secondary SoR for reconciliation, it affects multipliers (reconciliation/join signals) but does not increase baseline beyond the primary SoR baseline.

### 3.3 Mandatory completeness and validity

For any field:
- if the value is **missing/null** when it is required for the record grain, set \(M_{evidence}=0\) and reason `FIELD_MISSING`.
- if the value is present but **structurally invalid** (type/format violations), set \(M_{evidence}=0\) and reason `FIELD_INVALID_FORMAT`.

For **pilot-mandatory fields** (SoT Matrix `pilot_mandatory=Y`):
- any missing/invalid state is a **hard-zero** and triggers fail-closed gating (Section 8).

### 3.4 Freshness / effective-date alignment

Confidence must reflect whether the value is aligned to the snapshot/run effective date and the pay period (SoT Matrix + Validation Charter identifier requirements):

- If effective-date alignment is **verified** (value is valid for the snapshot effective date / pay period): \(M_{freshness}=1.0\)
- If alignment is **unknown** (missing effective dating metadata where required): \(M_{freshness}=0.7\) and reason `EFFECTIVE_DATE_UNKNOWN`
- If alignment is **mismatched** (known out-of-window): \(M_{freshness}=0.0\) and reason `EFFECTIVE_DATE_MISMATCH` (hard-zero for pilot-mandatory fields)

### 3.5 Reconciliation outcome multiplier

Reconciliation outcomes are evaluated per field based on H04 framework and exception taxonomy:

- **Reconciled within tolerance**: \(M_{recon}=1.0\)
- **Warning-level reconciliation exception** (taxonomy code with `severity_default=WARNING` and disposition allows proceed): \(M_{recon}=0.6\) + relevant reconciliation reason code(s)
- **Blocker-level reconciliation exception** affecting this field: \(M_{recon}=0.0\) and reason `RECON_BLOCKER` (hard-zero)

### 3.6 Join integrity multiplier

Join integrity is a confidence input and may be a hard-zero condition when ambiguous:

- **Unique, non-ambiguous join at declared grain**: \(M_{join}=1.0\)
- **Join present but imperfect** (allowed warning, e.g., non-critical join for non-mandatory field): \(M_{join}=0.7\) + reason `JOIN_WEAK`
- **Ambiguous join / duplicate key / cardinality breach**: \(M_{join}=0.0\) + reason `JOIN_AMBIGUOUS` (hard-zero for pilot-mandatory identifiers and any pilot-mandatory field depending on the join)

### 3.7 Override status multiplier (where applicable)

If a field’s truth is affected by an override (e.g., category assignment, equal-value grouping) per Methodology v1 governance:

- **No override involved**: \(M_{override}=1.0\)
- **Override present and APPROVED and not expired**: \(M_{override}=1.0\) (no penalty)
- **Override PENDING**: \(M_{override}=0.0\) + reason `OVERRIDE_PENDING` (hard-zero for category truth; blocks downstream)
- **Override EXPIRED**: \(M_{override}=0.0\) + reason `OVERRIDE_EXPIRED` (hard-zero)
- **Override REJECTED**: \(M_{override}=0.0\) + reason `OVERRIDE_REJECTED` (hard-zero)

---

## 4. Record-level confidence model

### 4.1 Record confidence score definition

Each record at the pilot’s defined grains (minimum: worker, worker-period, earning line) receives:
- **Record confidence score** \(C_r \in [0,100]\)
- **Record confidence status** (Section 10)
- **Record confidence reason codes** derived from the set of field reasons and record-level signals

Record confidence must support both:
- **record-level gating** (block record use in downstream computations/exports)
- **run-level rollups** (rates of low-confidence records as gate inputs)

### 4.2 Record-level aggregation logic (deterministic)

Let:
- \(F_{mandatory}\) = set of pilot-mandatory fields applicable to the record grain (from SoT Matrix v1)
- \(F_{supporting}\) = additional non-mandatory fields used for explainability or optional computations

Compute:

1) **Mandatory floor:**  
\[
C_{mandatory} = \min_{f \in F_{mandatory}} C_f
\]

2) **Supporting blend (optional):**  
Define weights \(w_f\) for supporting fields (default uniform unless methodology/reconciliation requires otherwise).  
Compute \(C_{supporting} = \text{weightedMean}(C_f)\) for \(f \in F_{supporting}\). If no supporting fields, omit.

3) **Record score:**  
For v1, record confidence is driven primarily by mandatory truth:
\[
C_r =
\begin{cases}
0 & \text{if any hard-zero trigger applies (Section 8)} \\
C_{mandatory} & \text{otherwise}
\end{cases}
\]

Rationale (binding): for pilot governance, **the weakest mandatory field controls** record usability. This prevents “averaging out” low-confidence mandatory truth.

### 4.3 Record confidence reasons

Record-level reasons MUST include:
- at least one reason code for each mandatory field with \(C_f\) below the “usable” threshold (Section 10)
- any record-level join/reconciliation blocker codes that triggered hard-zero
- any override status issues impacting the record’s category truth

---

## 5. Confidence input signals

This model evaluates the following minimum input signals (v1 set). Each input produces one or more reason codes when it reduces confidence.

1) **Source-of-record strength (SoT Matrix v1)**  
- uses `system_of_record_primary` + `pilot_mandatory` + `failure_severity`

2) **Completeness**  
- missing/null required fields at the record grain

3) **Structural validity**  
- type/format validity (IDs, ISO dates, ISO currency, enums)

4) **Freshness / effective-date alignment**  
- value valid for snapshot effective date / pay period boundaries

5) **Reconciliation outcome** (H04)  
- within tolerance vs exception-coded warning/blocker

6) **Join integrity** (Validation Charter v1 join integrity requirements; H04 join domain)  
- join coverage, duplicates, or cardinality ambiguity

7) **Override status** (Methodology v1)  
- approved vs pending/expired/rejected

8) **Evidence presence (methodology-required)** (Methodology v1 evidence standards)  
- where methodology requires evidence items (e.g., factor scores or perimeter exceptions), missing evidence reduces/zeros confidence for the affected methodological decision outputs

---

## 6. Confidence reason codes

Reason codes are stable identifiers that explain why confidence is reduced or zeroed. Codes must be emitted deterministically based on evaluated signals.

### 6.1 General / SoT reason codes

- `SOT_SOR_UNDECLARED` — SoT Matrix does not declare a usable system-of-record for this field (or field is missing from pilot-mandatory matrix coverage).  
- `SOT_FIELD_NOT_IN_MATRIX` — field evaluated is not present in SoT Matrix v1 rows (pilot governance gap; treat as low confidence).  
- `FIELD_MISSING` — required field is null/absent for record grain.  
- `FIELD_INVALID_FORMAT` — present but structurally invalid (type/format/enum).  
- `EFFECTIVE_DATE_UNKNOWN` — effective dating metadata required but missing.  
- `EFFECTIVE_DATE_MISMATCH` — known out-of-window for snapshot/pay period.

### 6.2 Join integrity reason codes

- `JOIN_WEAK` — join coverage below desired quality but not classified as blocker for this field (non-mandatory only).  
- `JOIN_AMBIGUOUS` — ambiguous join (duplicates/cardinality breach) affecting this field/record (hard-zero for pilot-mandatory dependencies).  
- `JOIN_MISSING` — required join missing (treated as hard-zero for pilot-mandatory linkage).

### 6.3 Reconciliation reason codes (taxonomy-linked)

These map to the H04 exception taxonomy codes and must preserve the originating code when possible. At minimum:

- `RECON_WARNING` — reconciliation emitted a warning exception affecting this field/record (include taxonomy code in evidence bundle).  
- `RECON_BLOCKER` — reconciliation emitted a blocker exception affecting this field/record (hard-zero).

### 6.4 Override governance reason codes (methodology-linked)

- `OVERRIDE_PENDING` — override exists but is not approved; blocks eligibility.  
- `OVERRIDE_EXPIRED` — override expired; treated as not applicable; blocks.  
- `OVERRIDE_REJECTED` — override rejected; blocks if it is being relied upon.  
- `METHODOLOGY_VERSION_MISSING` — missing methodology version reference (hard-zero for pilot outputs).  
- `METHODOLOGY_VERSION_MISMATCH` — methodology version does not match the approved/declared run version (hard-zero).

### 6.5 Evidence reason codes (methodology evidence standards)

- `EVIDENCE_MISSING_REQUIRED` — required evidence item(s) missing for a methodology decision unit; blocks approval where required.  
- `EVIDENCE_INSUFFICIENT_TIER` — evidence exists but does not meet tier minimum (e.g., tier C only for a high score).  

---

## 7. Propagation rules

Propagation defines how confidence reductions in one signal/field deterministically impact other fields, records, and downstream eligibility.

### 7.1 Hard-zero propagation

If any of the following occurs for a record, set affected field confidence to **0** and propagate to record confidence \(C_r=0\):

- missing pilot-mandatory field (`FIELD_MISSING` on a pilot-mandatory field)
- invalid pilot-mandatory field (`FIELD_INVALID_FORMAT` on a pilot-mandatory field)
- ambiguous join on mandatory identifier (`JOIN_AMBIGUOUS` on any pilot-mandatory identifier or join dependency)
- blocker reconciliation exception affecting a pilot-mandatory remuneration field (`RECON_BLOCKER` with taxonomy code impacting base/variable pay)
- missing/mismatched methodology version (`METHODOLOGY_VERSION_*`)
- pending/expired override affecting category truth (`OVERRIDE_*` in non-approved state)

### 7.2 Dependency propagation

If a field is derived from other fields per SoT Matrix derivation logic, then:

- \(C_{derived} \le \min(C_{inputs})\)  
- If any input is hard-zero, derived is hard-zero.

### 7.3 “Do not smooth ambiguity” rule

When multiple candidate source records could populate a field (ambiguous join), **do not** select one and assign partial confidence. Instead:

- emit `JOIN_AMBIGUOUS`
- set \(C_f := 0\) for impacted fields
- block downstream eligibility per fail-closed triggers

### 7.4 Override propagation (category truth)

If category assignment is affected by an override that is not approved/in-date:
- category-related fields (`category_id`, `category_assignment_basis`, `override_id/flag`) are hard-zero
- record confidence is hard-zero
- category eligibility fails and therefore metrics/reporting eligibility fails (Section 9)

---

## 8. Fail-closed triggers

Fail-closed triggers block downstream use. They are evaluated at field, record, and run levels.

### 8.1 Field-level fail-closed triggers (minimum v1)

**Trigger FC-F1 — Missing pilot-mandatory field**  
Condition: any SoT Matrix v1 `pilot_mandatory=Y` field is missing/invalid.  
Action: set \(C_f=0\), emit reasons, block record and all downstream outputs relying on this record.

**Trigger FC-F2 — Ambiguous join on mandatory identifier**  
Condition: `JOIN_DUPLICATE_KEY`/`JOIN_AMBIGUOUS` affects `worker_id`, `payroll_worker_id`, `assignment_id`, or other pilot-mandatory join keys.  
Action: set impacted field confidence to 0; record confidence to 0; block category/metrics/reporting eligibility.

**Trigger FC-F3 — Unreconciled mandatory remuneration field**  
Condition: blocker reconciliation exception affects `base_pay_amount`, `variable_pay_amount`, `earning_code` mapping, `currency_code`, pay period alignment, or other remuneration pilot-mandatory fields.  
Action: set \(C_f=0\) for impacted remuneration fields; record confidence 0; block metrics and reporting exports.

**Trigger FC-F4 — Methodology version missing/mismatch**  
Condition: missing or mismatched `methodology_version` reference for the run/record.  
Action: set record confidence 0; block category/metrics/reporting outputs (defensibility failure).

**Trigger FC-F5 — Pending/expired override affecting category truth**  
Condition: override exists but status is pending/expired/rejected.  
Action: set category truth confidence 0; block category eligibility and downstream.

### 8.2 Run-level fail-closed triggers (minimum v1)

**Trigger FC-R1 — Exclusion/confidence breach rate too high for metrics run validity**  
Condition: For a metrics run, the share of in-scope records that are blocked or low confidence exceeds a defined threshold (Section 10).  
Action: block **metrics run validity** and **export eligibility** even if some records individually pass; require VSG disposition.

For v1, define run-level breach as:
- `blocked_record_rate` = blocked records / in-scope records
- `low_confidence_record_rate` = records with status LOW or below / in-scope records

Default thresholds in Section 10.

---

## 9. Downstream impact rules

Confidence drives downstream eligibility for three output domains: **category**, **metrics**, **reporting/evidence-pack export**.

### 9.1 Category eligibility rules

A record is **category-eligible** if:
- all pilot-mandatory identity/join fields required for category truth have \(C_f \ge\) the **pilot-mandatory usable threshold** (Section 10), and
- there are no `JOIN_AMBIGUOUS`, `OVERRIDE_PENDING/EXPIRED/REJECTED`, or `METHODOLOGY_VERSION_*` reasons, and
- any methodology-required evidence for equal-value decisions is present where the basis requires it.

If not category-eligible:
- category assignment must be treated as **blocked/review-required** and must not be used for metrics aggregation.

### 9.2 Metrics eligibility rules

A record is **metrics-eligible** if:
- it is category-eligible, and
- all pilot-mandatory remuneration fields used by the metrics have \(C_f \ge\) the pilot-mandatory usable threshold, and
- there are no blocker reconciliation reasons impacting remuneration (H04), and
- the run-level breach triggers (FC-R1) are not exceeded.

If metrics-eligible fails for any record:
- that record must be **excluded** from metric computation with coded reasons (reason codes + reconciliation taxonomy codes).

If run-level eligibility fails (FC-R1):
- the entire metrics output must be labeled **NOT_VALID** (blocked) and must not be exported as a compliant result.

### 9.3 Reporting / evidence-pack export eligibility rules

An evidence pack/export is eligible only if:
- category outputs used are category-eligible, and
- metrics outputs are metrics-eligible and run validity is PASS, and
- required evidence bundle items are present (Section 12), and
- confidence model version references are included.

If export eligibility fails:
- export must be blocked with explicit blocker reason codes and references.

---

## 10. Thresholds and statuses

### 10.1 Field and record statuses (v1)

Map confidence score to a status:

- **HIGH**: 90–100 (usable)
- **MEDIUM**: 80–89 (usable for pilot-mandatory; reviewer attention may be required)
- **LOW**: 60–79 (not usable for pilot-mandatory; usable only for non-mandatory informational fields with explicit risk)
- **VERY_LOW**: 1–59 (not usable; indicates material deficiencies)
- **ZERO**: 0 (blocked; hard-zero trigger)

### 10.2 Usability thresholds (v1; binding)

- **Pilot-mandatory field usable threshold:** \(C_f \ge 80\)  
If \(C_f < 80\) on any pilot-mandatory field for a record, downstream use must be blocked.

- **Pilot-mandatory record usable threshold:** \(C_r \ge 80\)  
Record confidence below 80 blocks downstream use (even if some non-mandatory fields are high).

### 10.3 Run-level breach thresholds (v1; binding)

These thresholds block a metrics run and evidence export:

- **blocked_record_rate** must be \(\le 0.5\%\)  
- **low_confidence_record_rate** (status LOW or below) must be \(\le 2.0\%\)

If exceeded: trigger `FC-R1` and block metrics run validity and exports until VSG disposition (Validation Charter decision log).

---

## 11. Reviewer visibility requirements

Confidence must be visible to reviewers in a control-grade way. At minimum, for each run:

- A **field-level** view for pilot-mandatory fields showing:
  - score, status, reason codes, and the SoT Matrix row reference (field name + version)
  - reconciliation taxonomy codes affecting the field (if any)
- A **record-level** view showing:
  - record confidence score/status
  - list of blocking reasons (hard-zero triggers)
  - whether the record is category-eligible and metrics-eligible
- A **run-level** summary showing:
  - blocked_record_rate, low_confidence_record_rate
  - counts by reason code (top contributors)
  - whether any fail-closed triggers fired and which downstream outputs are blocked

Reviewer visibility must support:
- Internal Audit/Assurance review (traceability and evidence sufficiency)
- Payroll controls review (reconciliation and mapping issues)
- Reward/Legal review (methodology and override governance)

---

## 12. Evidence and audit requirements

Confidence is an auditable control output. Every confidence assessment must be evidence-backed and versioned.

Minimum evidence bundle requirements for Gate G6 and pilot runs:

- **Version manifest** including:
  - confidence model id/version
  - SoT Matrix id/version
  - Methodology id/version
  - Reconciliation framework id/version
  - snapshot/run identifiers
  - mapping version identifiers referenced by SoT Matrix (e.g., pay component mapping version)
- **Confidence outputs** (field-level and record-level) with:
  - score, status, reason codes
  - links to reconciliation exception codes (when relevant)
- **Gate evaluation record**:
  - which fail-closed triggers fired (FC-F* and FC-R*)
  - which downstream outputs are blocked and why
- **Exception disposition references** for any warning allowed to proceed:
  - decision log entry reference (Validation Charter Section 12)
  - owner role approval evidence

Append-only rule (binding): confidence evidence outputs are append-only per run; corrections are new runs/records, not in-place edits.

---

## 13. References to related control artifacts

Binding references:

- Validation Charter v1: `docs/validation/VALIDATION_CHARTER_v1.md` (Gate **G6**, fail-closed posture, veto/authority model)
- Enterprise Hardening Redirect: `docs/validation/REDIRECT_DECISION.md` (validation-first enforcement)
- Source-of-Truth Matrix v1:
  - `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md`
  - `docs/data-governance/source-of-truth-matrix_v1.csv`
  - `docs/data-governance/source-of-truth-matrix_v1.json`
- Methodology v1:
  - `docs/methodology/METHODOLOGY_v1.md`
  - `docs/methodology/methodology_v1.json`
- Reconciliation framework + exception taxonomy v1:
  - `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`
  - `docs/reconciliation/exception-taxonomy_v1.json`

