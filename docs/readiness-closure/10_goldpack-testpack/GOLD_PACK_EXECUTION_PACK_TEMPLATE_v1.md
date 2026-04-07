# GOLD_PACK_EXECUTION_PACK_TEMPLATE_v1 — Readiness-Closure (Wave R / R12)
**Template ID:** R12-GOLD-PACK-EXECUTION-PACK-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does not execute gold packs/test packs, does not certify pilot readiness, does not fabricate results, and does not replace required approvals.

---

## How to use (governance-only)
- Create **one execution evidence pack per executed run attempt** (or per controlled rerun) that claims to execute one or more gold-pack scenarios.
- Populate all required fields.
- If a field cannot be populated in mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Do not embed sensitive worker-level drill-down rows in-repo. Use stable, access-controlled pointers and digests.
- Packs are **append-only**: do not overwrite prior packs; create a new pack per rerun and reference the superseded pack.

---

## Execution evidence pack template (copy/paste)

### A) Pack header (identity)
- **execution_pack_id**: `<<R12-GPEX-YYYYMMDD-###>>`
- **created_at_iso**: `<<YYYY-MM-DDTHH:MM:SSZ>>`
- **prepared_by**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
- **mode**: `<<MOCK/TEST GOVERNANCE ONLY | REAL PILOT EVIDENCE>>`

### B) Perimeter reference (scope binding)
- **perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`
- **perimeter_interpretation**: `<<MOCK/SYNTHETIC | REAL>>`
- **scope_notes**: `<<must not broaden scope silently>>`

### C) Gold-pack and validation-pack references
- **gold-pack reference**: `docs/validation/PILOT_GOLD_PACKS_v1.md` + `<<gold_pack_id or pack label>>`
- **validation-pack reference**: `docs/validation/pilot-validation-test-packs_v1.json` + `<<validation_pack_id + version>>`

### D) Governing artifact version manifest (control artifacts)
List the versions governing this execution (or `NOT AVAILABLE (MOCK/TEST)` if not applicable):
- **Validation Charter reference**: `docs/validation/VALIDATION_CHARTER_v1.md`
- **SoT Matrix reference**: `<<docs/data-governance/source-of-truth-matrix_v1.json (+ md/csv) version marker>>`
- **Methodology reference**: `<<docs/methodology/methodology_v1.json (+ md) version marker>>`
- **Reconciliation framework reference**: `<<docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md version marker>>`
- **Exception taxonomy reference**: `docs/reconciliation/exception-taxonomy_v1.json (exception_taxonomy_v1 v1.0.0)`
- **Confidence model reference**: `<<docs/confidence/confidence-model_v1.json (+ md) version marker>>`
- **Mapping governance reference(s)**: `<<mapping_version_id + lock record reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **Join integrity proof reference**: `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_PROOF_v1.md (R05-JOIN-INTEGRITY-PROOF-v1)`

### E) Source artifact references (inputs)
Provide stable pointers (do not embed raw extracts):
- **source artifact references**:
  - `<<extract manifest reference(s) (R04), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<join integrity report reference(s) (R05), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<reconciliation report reference(s) (R07), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<exception register reference(s) (R08), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<confidence output reference(s) (R09), or NOT AVAILABLE (MOCK/TEST)>>`
  - `<<decision record pack reference(s) (R11), or NOT AVAILABLE (MOCK/TEST)>>`

---

## 1) Scenario list executed (required)

For each executed scenario (must match the validation pack catalog):

- **scenario_execution**:
  - **scenario_id**: `<<e.g., PVTP-004>>`
  - **scenario_title**: `<<title copied from pilot-validation-test-packs_v1.json>>`
  - **scenario_category**: `<<category from the catalog>>`
  - **baseline_vs_exception_pack**: `<<BASELINE | EXCEPTION>>`
  - **expected_outcomes_reference**: `docs/validation/pilot-validation-test-packs_v1.json#scenario_id=<<PVTP-###>>`
  - **expected_exception_codes**: `<<list from catalog; may be empty>>`

Repeat the `scenario_execution` block for each scenario executed. Do not use “all scenarios” shorthand.

---

## 2) Expected outcomes reference (required)

- **expected outcomes reference policy**:
  - Expected outcomes are defined by the validation pack catalog entry (do not restate expected outcomes as ad hoc text).
  - If an expected outcome is disputed or changes, the validation pack catalog must be versioned and referenced explicitly (do not edit expected outcomes inside this execution pack).

---

## 3) Actual outcomes summary (required; structured)

For each scenario, summarize the actual outcomes using the five outcome axes.

- **scenario_actual_outcomes**:
  - **scenario_id**: `<<PVTP-###>>`
  - **join_outcome_actual**: `<<PASS | WARNING | BLOCKER | NOT_EVALUATED>>`
  - **reconciliation_outcome_actual**: `<<PASS_WITHIN_TOLERANCE | WARNING_EXCEPTION | BLOCKER_EXCEPTION | NOT_EVALUATED>>`
  - **confidence_outcome_actual**: `<<PASS | FAIL_CLOSED | NOT_EVALUATED>>`
  - **category_or_methodology_outcome_actual**: `<<PASS | REVIEW_REQUIRED | BLOCKED | NOT_EVALUATED>>`
  - **export_or_run_gate_outcome_actual**: `<<ALLOW | BLOCK_EXPORT | BLOCK_RUN_VALIDITY | NOT_EVALUATED>>`
  - **actual_evidence_pointers**:
    - `<<pointer(s) to join report ids, recon report ids, confidence pack ids, exception ids, etc.>>`
  - **notes**: `<<short; no sensitive rows>>`

---

## 4) Expected-vs-actual variance summary (required; explicit)

For each scenario, compare expected vs actual per axis.

- **scenario_variance**:
  - **scenario_id**: `<<PVTP-###>>`
  - **axis_variances**:
    - **join_outcome**:
      - expected: `<<...>>`
      - actual: `<<...>>`
      - variance: `<<MATCH | MISMATCH | NOT_EVALUATED>>`
    - **reconciliation_outcome**:
      - expected: `<<...>>`
      - actual: `<<...>>`
      - variance: `<<MATCH | MISMATCH | NOT_EVALUATED>>`
    - **confidence_outcome**:
      - expected: `<<...>>`
      - actual: `<<...>>`
      - variance: `<<MATCH | MISMATCH | NOT_EVALUATED>>`
    - **category_or_methodology_outcome**:
      - expected: `<<...>>`
      - actual: `<<...>>`
      - variance: `<<MATCH | MISMATCH | NOT_EVALUATED>>`
    - **export_or_run_gate_outcome**:
      - expected: `<<...>>`
      - actual: `<<...>>`
      - variance: `<<MATCH | MISMATCH | NOT_EVALUATED>>`
  - **variance_summary**: `<<short explanation; if mismatch, link to exceptions/dispositions or catalog version change proposal>>`
  - **linked_exception_references**: `<<R08 exception_id list OR NOT AVAILABLE (MOCK/TEST)>>`

---

## 5) Related references (required)

- **related exception references**: `<<list R08 exception_id values OR NOT AVAILABLE (MOCK/TEST)>>`
- **related reconciliation references**: `<<list of R07 reconciliation report_id references OR NOT AVAILABLE (MOCK/TEST)>>`
- **related confidence output references**: `<<list of R09 output_pack_id references OR NOT AVAILABLE (MOCK/TEST)>>`
- **related join-integrity references**: `<<list of R05 join report_id references OR NOT AVAILABLE (MOCK/TEST)>>`
- **related decision record references**: `<<decision record ids/paths OR NOT AVAILABLE (MOCK/TEST)>>`

---

## 6) Rerun identifier and supersession (required)

- **rerun_id**: `<<R12-RERUN-YYYYMMDD-###>>`
- **rerun_of_execution_pack_id**: `<<prior execution_pack_id OR NONE>>`
- **rerun_reason**: `<<why this rerun exists (mapping version changed / extract corrected / join key fixed / expected outcome version updated / etc.)>>`
- **what_changed**:
  - `<<list control artifacts or input pointers that changed>>`

---

## 7) Completeness status (required; objective)

- **completeness_status**: `<<COMPLETE (GOVERNANCE) | INCOMPLETE (MISSING REQUIRED EVIDENCE) | NOT ASSESSED>>`
- **completeness_checklist**:
  - [ ] execution_pack_id present
  - [ ] perimeter reference present + interpretation labeled (MOCK/SYNTHETIC vs REAL)
  - [ ] gold-pack reference present
  - [ ] validation-pack reference present (id + version)
  - [ ] scenario list executed enumerated (scenario_id list)
  - [ ] expected outcomes references present (per scenario)
  - [ ] actual outcomes summary present (per scenario, axis-level)
  - [ ] expected-vs-actual variance present (per scenario, axis-level)
  - [ ] rerun identity present (rerun_id; supersession references if applicable)
  - [ ] related references section populated (or explicitly NOT AVAILABLE)
  - [ ] review + sign-off section present
- **missing_items**: `<<list missing items if any>>`
- **notes**: `<<short>>`

---

## 8) Reviewer, sign-off status, and notes (required)

- **reviewer**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
- **review_date**: `<<YYYY-MM-DD>>`
- **sign-off status**: `<<NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)>>`
- **notes**: `<<review notes, outstanding blockers, links to decision records if any>>`

