# CONFIDENCE_OUTPUT_PACK_TEMPLATE_v1 — Readiness-Closure (Wave R / R09)
**Artifact ID:** R09-CONFIDENCE-OUTPUT-PACK-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does not execute confidence scoring, does not certify pilot readiness, and does not replace required approvals.

---

## How to use (governance-only)

- Create **one output pack per run** that claims to evaluate confidence under a named confidence model version.
- Populate all required fields.
- If a field cannot be populated in mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Do not embed sensitive worker-level drill-down rows in this repo. Use stable, access-controlled pointers for evidence and drill-down.
- Outputs are **append-only**: do not overwrite prior packs; create a new pack per rerun/version change.

---

## Confidence output pack template (copy/paste)

### A) Output pack header

- **output_pack_id**: `<<R09-CONF-OUT-YYYYMMDD-###>>`
- **created_at_iso**: `<<YYYY-MM-DDTHH:MM:SSZ>>`
- **prepared_by**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`

### B) Perimeter and governance references

- **perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`
- **confidence model version reference**: `docs/confidence/CONFIDENCE_MODEL_v1.md` + `docs/confidence/confidence-model_v1.json` + `<<confidence_model_id + version>>`

### C) Source artifact references (inputs)

- **source artifact references**:
  - `<<extract manifest reference(s) (R04 structure), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<join integrity report reference(s) (R05), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<reconciliation report reference(s) (R07), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<exception register reference(s) (R08), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<methodology/override decision references (H03), or NOT AVAILABLE (MOCK/TEST)>>`

### D) Version manifest (control artifacts)

- **control artifact version references**:
  - **SoT Matrix reference**: `<<docs/data-governance/source-of-truth-matrix_v1.json (+ md/csv) version marker>>`
  - **Methodology reference**: `<<docs/methodology/methodology_v1.json (+ md) version marker>>`
  - **Reconciliation framework reference**: `<<docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md version marker>>`
  - **Exception taxonomy reference**: `docs/reconciliation/exception-taxonomy_v1.json (exception_taxonomy_v1 v1.0.0)`
  - **Join integrity proof reference**: `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_PROOF_v1.md (R05-JOIN-INTEGRITY-PROOF-v1)`
  - **Mapping governance reference(s)**: `<<R06 mapping version lock id/reference OR NOT AVAILABLE (MOCK/TEST)>>`

---

## 1) Field-level confidence summary (required)

### 1.1 Summary table (minimum)

- **field-level confidence summary**:
  - **record_grain(s) evaluated**: `<<e.g., worker-period>>`
  - **pilot_mandatory_field_set_reference**: `<<SoT Matrix v1 filter statement or pointer>>`
  - **field_status_counts**:
    - HIGH: `<<count or NOT AVAILABLE (MOCK/TEST)>>`
    - MEDIUM: `<<count or NOT AVAILABLE (MOCK/TEST)>>`
    - LOW: `<<count or NOT AVAILABLE (MOCK/TEST)>>`
    - VERY_LOW: `<<count or NOT AVAILABLE (MOCK/TEST)>>`
    - ZERO: `<<count or NOT AVAILABLE (MOCK/TEST)>>`
  - **fields_below_pilot_mandatory_threshold**:
    - `<<list of field ids + reason codes + evidence pointers OR NOT AVAILABLE (MOCK/TEST)>>`
  - **top_reason_codes_field_level**:
    - `<<reason_code -> count, with evidence pointers OR NOT AVAILABLE (MOCK/TEST)>>`

### 1.2 Notes (required)
- **notes**: `<<definitions, thresholds used, any deviations (must reference decision record), limitations>>`

---

## 2) Record-level confidence summary (required)

### 2.1 Summary (minimum)

- **record-level confidence summary**:
  - **record_grain**: `<<e.g., worker-period>>`
  - **in_scope_record_count**: `<<number or NOT AVAILABLE (MOCK/TEST)>>`
  - **blocked_record_count**: `<<number>>`
  - **blocked_record_rate**: `<<number>>` (must match formula + denominator policy below)
  - **low_confidence_record_count**: `<<number>>`
  - **low_confidence_record_rate**: `<<number>>`
  - **blocked_record_definition**: `<<e.g., record_score == 0 OR fail-closed trigger fired>>`
  - **low_confidence_definition**: `<<e.g., record_status in [LOW, VERY_LOW, ZERO]>>`
  - **denominator_policy**: `<<in_scope_record_count>>`

### 2.2 Blocked and low-confidence breakdowns (minimum)

- **blocked record breakdown (by reason codes)**:
  - `<<reason_code -> count, with evidence pointers OR NOT AVAILABLE (MOCK/TEST)>>`

- **low-confidence record breakdown (by reason codes)**:
  - `<<reason_code -> count, with evidence pointers OR NOT AVAILABLE (MOCK/TEST)>>`

### 2.3 Eligibility flags summary (minimum)

- **category_eligible_record_count**: `<<number or NOT AVAILABLE (MOCK/TEST)>>`
- **metrics_eligible_record_count**: `<<number or NOT AVAILABLE (MOCK/TEST)>>`
- **reporting_export_eligible**: `<<YES | NO | NOT AVAILABLE (MOCK/TEST)>>`

---

## 3) Run-level confidence summary (required)

### 3.1 Run-level metrics (required)

- **run-level confidence summary**:
  - **blocked_record_count**: `<<number>>`
  - **blocked_record_rate**: `<<number>>`
  - **low_confidence_record_count**: `<<number>>`
  - **low_confidence_record_rate**: `<<number>>`
  - **breach_thresholds**:
    - **blocked_record_rate_max**: `0.005` (0.5%) unless superseded by a decision record
    - **low_confidence_record_rate_max**: `0.02` (2.0%) unless superseded by a decision record
  - **threshold result**: `<<PASS | FAIL | NOT AVAILABLE (MOCK/TEST)>>`
  - **blocker / warning result**: `<<BLOCKER | WARNING | NONE | NOT AVAILABLE (MOCK/TEST)>>`

### 3.2 Downstream impact summary (required)

- **downstream impact summary**:
  - **category outputs**: `<<ALLOWED | BLOCKED | NOT AVAILABLE (MOCK/TEST)>>`
  - **metrics outputs**: `<<ALLOWED | BLOCKED | NOT_VALID | NOT AVAILABLE (MOCK/TEST)>>`
  - **reporting/export**: `<<ALLOWED | BLOCKED | NOT AVAILABLE (MOCK/TEST)>>`
  - **blocked_outputs_reasons**:
    - `<<list of trigger ids / reason codes + evidence pointers OR NOT AVAILABLE (MOCK/TEST)>>`

---

## 4) Fail-closed triggers observed (required)

- **fail_closed_triggers_observed**:
  - `<<trigger_id>>`:
    - **description**: `<<text>>`
    - **level**: `<<field | record | run>>`
    - **affected_record_count**: `<<number or NOT AVAILABLE (MOCK/TEST)>>`
    - **evidence_pointers**: `<<join/recon/exception references>>`
    - **related exception references**: `<<R08 exception_id list OR NOT AVAILABLE (MOCK/TEST)>>`

Minimum trigger ids expected to be representable (align to Confidence Model v1):
- `FC-F1` missing pilot-mandatory field
- `FC-F2` ambiguous join on mandatory identifier
- `FC-F3` unreconciled mandatory remuneration field
- `FC-F4` methodology version missing/mismatch
- `FC-F5` pending/expired/rejected override affecting category truth
- `FC-R1` run-level breach rate too high

---

## 5) Related references (required)

- **related exception references**: `<<list R08 exception_id values OR NOT AVAILABLE (MOCK/TEST)>>`
- **related reconciliation references**: `<<list of R07 reconciliation report_id references OR NOT AVAILABLE (MOCK/TEST)>>`
- **related join-integrity references**: `<<list of R05 join report_id references OR NOT AVAILABLE (MOCK/TEST)>>`

---

## 6) Reviewer interpretation (required)

- **reviewer-facing interpretation**:
  - **run outcome narrative**: `<<what happened; what is blocked; why>>`
  - **top contributors**: `<<top reason codes / triggers and their contributors>>`
  - **rerun expectation**: `<<what must change for rerun (versions, extracts, mapping, joins, reconciliations)>>`
  - **what can and cannot be accepted as risk**: `<<reminder that accepted exceptions require decision records; do not fabricate>>`

---

## 7) Review and sign-off (required)

- **reviewer**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
- **sign-off status**: `<<NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)>>`
- **blocker / warning result**: `<<BLOCKER | WARNING | NONE | NOT AVAILABLE (MOCK/TEST)>>`
- **notes**: `<<review notes, outstanding evidence, references to decision records if any>>`

