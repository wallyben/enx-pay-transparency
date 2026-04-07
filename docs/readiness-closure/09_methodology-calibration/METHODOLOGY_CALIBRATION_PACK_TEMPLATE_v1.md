# METHODOLOGY_CALIBRATION_PACK_TEMPLATE_v1 — Readiness-Closure (Wave R / R10)
**Template ID:** R10-METHODOLOGY-CALIBRATION-PACK-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does **not** execute calibration. It defines the required structure to package calibration evidence, decisions, challenges, and sign-offs without fabricating results.

---

## How to use this template (binding)

- Create a new file per calibration pack and keep it **append-only**: do not overwrite prior packs; supersede via a new pack and reference the prior `calibration_pack_id`.
- Do not embed sensitive worker-level or payroll rows in-repo. Use stable, access-controlled pointers.
- In mock/test readiness-closure mode, fields may be set to `NOT AVAILABLE (MOCK/TEST)` where real values do not exist. Do **not** invent results or approvals.

---

## 1. Pack header

- **calibration_pack_id**: `CAL-METHV1-YYYYMMDD-###`  
- **created_at_iso**:  
- **prepared_by**: (role + name) or `NOT AVAILABLE (MOCK/TEST)`  
- **pack_status**: `DRAFT | IN_REVIEW | FINAL`  
- **mode**: `MOCK/TEST GOVERNANCE ONLY | REAL PILOT EVIDENCE`  
- **supersedes_calibration_pack_id**: (optional)  

---

## 2. Perimeter and scope binding

- **perimeter_reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`  
- **perimeter_interpretation**: `MOCK/SYNTHETIC` (required in current mode)  
- **scope_notes**: (explicitly state what is included/excluded for this calibration pack; must not broaden scope silently)

---

## 3. Methodology version binding

- **methodology_id**: `methodology_v1`  
- **methodology_version_reference**: (e.g., `v1.0.0`)  
- **methodology_artifacts**:
  - `docs/methodology/METHODOLOGY_v1.md`
  - `docs/methodology/methodology_v1.json`
- **methodology_change_control_notes**: (if any calibration outcome proposes changes that would require a version increment)

---

## 4. Calibration sample reference

- **calibration_sample_id**:  
- **sample_selection_reference**: (document pointer or controlled artifact id)  
- **sample_selection_rationale**:  
- **sample_definition**:
  - **inclusion_criteria**:
  - **exclusion_criteria**:
  - **representation_requirements** (per Methodology v1 §8.2):
    - roles believed comparable:
    - roles believed not comparable:
    - boundary cases (job level transitions):
    - materially different working conditions:
  - **sample_size_summary**:
  - **bias_controls**: (how cherry-picking is avoided)
- **sample_items_pointer**: (link to controlled list; do not embed sensitive detail here)

---

## 5. Factor set reference

- **factor_set_id**: (e.g., `methodology_v1.factor_set.v1`)  
- **factor_set_reference**: (pointer to the governing methodology section / JSON ids)  
- **factors_in_scope**:
  - skills_knowledge
  - effort
  - responsibility
  - working_conditions
- **scoring_scale_id**: (e.g., `ordinal_0_4_anchored`)  

---

## 6. Weighting and tolerance reference

- **weight_set_id**: (e.g., `v1_default`)  
- **weighting_reference**: (pointer to methodology artifacts and any controlled record)  
- **weights** (copy from governing methodology; do not edit here unless explicitly proposed):
  - responsibility:
  - skills_knowledge:
  - effort:
  - working_conditions:
- **tolerance_band_reference**: (pointer to Methodology v1 tolerance section)  
- **tolerance_band_value**: (e.g., `0.40`)  
- **perimeter_constraints_reference**: (job level sanity, working conditions gating, etc.)

---

## 7. Calibration participants

- **participants** (roles + names; names may be omitted in mock/test):
  - Reward methodology owner:
  - Reward peer reviewer(s):
  - Legal reviewer:
  - Internal Audit / Assurance reviewer:
  - Payroll controls consulted:
  - Other:
- **facilitator**:
- **note_on_separation_of_duties**: (how requester vs approver separation is maintained)

---

## 8. Calibration session dates

- **session_dates**:
  - session_1:
  - session_2:
  - session_n:
- **timebox_notes**:

---

## 9. Evidence inputs used

### 9.1 Evidence input inventory (required)
List all evidence sources used to support calibration scoring and decisions.

For each item:
- **evidence_input_id**:
- **title**:
- **tier**: `A | B | C` (per Methodology v1)
- **source_system_or_artifact**:
- **pointer/location**: (access-controlled reference)
- **retrieval_constraints**: (who can access)
- **notes**:

### 9.2 Evidence sufficiency checks (required)
- **evidence_minimums_reference**: (Methodology v1 §7.2)
- **evidence_gaps_identified**: (Yes/No)
- **evidence_gap_summary**: (if yes)

---

## 10. Calibration checks and outputs (structure)

**Important:** In mock/test mode, include the section structure and state `NOT AVAILABLE (MOCK/TEST)` for results.

### 10.1 Distribution of weighted totals \(T\)
- **definition_reference**: (Methodology v1 §6.2)
- **distribution_summary**: `NOT AVAILABLE (MOCK/TEST)` / (if real: provide summary + pointer to detailed analysis)
- **outlier_handling_notes**:

### 10.2 Weight sensitivity analysis (±0.05 per factor)
- **sensitivity_plan_reference**:
- **sensitivity_results_summary**: `NOT AVAILABLE (MOCK/TEST)` / (if real: summary + pointer)
- **materiality_definition**:

### 10.3 Expected decisions and alignment
- **expected_decisions_reference**: (controlled list pointer)
- **alignment_summary**: `NOT AVAILABLE (MOCK/TEST)` / (if real: summary + pointer)
- **divergence_summary**: (where outcomes diverge from expectations; include pointer)

### 10.4 Calibration outputs summary (required)
- **calibration_outputs_summary**: (short narrative)
- **parameter_change_proposals_present**: `Yes | No`

---

## 11. Challenged items

List all challenged items and keep unresolved challenges visible.

For each challenge:
- **challenge_id**:
- **challenged_item**:
- **raised_by**: (role)
- **raised_at_iso**:
- **rationale**:
- **evidence_references**: (pointers)
- **status**: `OPEN | UNDER_REVIEW | RESOLVED | ESCALATED`
- **outcome** (if resolved): `UPHELD | AMENDED | REJECTED`
- **escalation_reference** (if escalated): (VSG reference / decision record pointer)
- **notes**:

---

## 12. Decisions reached

Record calibration decisions explicitly. Do not imply approval by listing a decision.

For each decision:
- **decision_id**:
- **decision_statement**:
- **decision_type**: `RETENTION | PROPOSED_CHANGE | PROCESS_CHANGE | EVIDENCE_MINIMUM_CHANGE | OTHER`
- **rationale**:
- **evidence_references**: (pointers)
- **impact_summary**: (what could change; scope of impact)
- **status**: `PROPOSED | APPROVED | REJECTED | SUPERSEDED`
- **related_decision_record_references**: (see Section 15)

---

## 13. Unresolved items (must remain visible)

For each unresolved item:
- **unresolved_item_id**:
- **description**:
- **owner_role**:
- **what_is_missing**:
- **blocking_flag**: `YES | NO`
- **target_review_date**:
- **linked_challenge_id**: (optional)
- **notes**:

**Binding rule:** Any unresolved item with `blocking_flag = YES` blocks methodology sign-off unless explicitly dispositioned by the authority model (do not fabricate).

---

## 14. Sign-off required from (minimum)

- Reward methodology owner (approval)
- Legal (employment/regulatory) (sign-off)
- Internal Audit / Assurance (acknowledgement)

Optional acknowledgements (as applicable):
- Payroll controls owner (consulted acknowledgement)
- Privacy/Security (only if evidence handling/access controls are in scope for calibration evidence)

---

## 15. Sign-off status

For each required sign-off:
- **role**:
- **name**: `NOT AVAILABLE (MOCK/TEST)` / (real)
- **status**: `NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)`
- **signed_at_iso**:
- **conditions**:
- **notes**:

---

## 16. Related decision record references

List decision record IDs and pointers that:
- adopt or sign off this calibration pack, and/or
- approve any methodology-changing calibration outcomes, and/or
- disposition any blocking unresolved calibration disagreement.

For each reference:
- **decision_record_id**:
- **pointer/path**:
- **status**:
- **notes**:

---

## 17. Notes

- **notes**:

