# DECISION_RECORD_PACK_TEMPLATE_v1 — Readiness-Closure (Wave R / R11)
**Template ID:** R11-DECISION-RECORD-PACK-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does **not** create decisions, does **not** execute approvals, and does **not** authorize pilot entry or pilot execution.

---

## How to use this template (binding)

- Create a **new file per pack instance** under `docs/readiness-closure/01_decision-log/`.
- Keep packs **append-only** in practice: do not erase prior states; supersede with a new `pack_id` and reference the prior pack.
- Do not invent decision record IDs, decisions, approvals, or outcomes. If a required decision does not exist, list it under “missing required decision records”.
- In mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` for identities and sign-off values that do not exist.

---

## 1. Pack header

- **pack_id**: `R-DRP-YYYYMMDD-###`  
- **created_at_iso**:  
- **mode**: `MOCK/TEST GOVERNANCE ONLY | REAL PILOT EVIDENCE`  
- **prepared_by**: (role + name) or `NOT AVAILABLE (MOCK/TEST)`  
- **supersedes_pack_id**: (optional)  
- **notes**:

---

## 2. Perimeter reference (scope binding)

- **perimeter_reference**: (required pointer; typically `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`)  
- **perimeter_interpretation**: `MOCK/SYNTHETIC | REAL`  
- **perimeter_decision_record_reference**: (e.g., `DR-0003` if approved; otherwise note status)  
- **scope_notes**: (must not broaden silently)

---

## 3. Charter reference (authority/veto model binding)

- **charter_reference**: `docs/validation/VALIDATION_CHARTER_v1.md`  
- **charter_adoption_decision_record_reference**: (e.g., `DR-0002`)  
- **authority_model_notes**: (e.g., quorum/veto relevance; do not claim approvals)

---

## 4. Decision log reference

- **decision_log_reference**: `docs/readiness-closure/01_decision-log/DECISION_LOG.md`  
- **decision_log_snapshot_notes**: (optional; e.g., register status at time of pack creation)

---

## 5. Included decision records

List each included decision record. Do not include records that are not registered (or explicitly planned to be registered) in the decision log.

For each entry:
- **decision_record_id**: (e.g., `DR-0001`)  
- **title**:  
- **status**: `PROPOSED | APPROVED | REJECTED | SUPERSEDED`  
- **category_or_categories**: (use the required categories from `DECISION_RECORD_PACK_v1.md` §3)  
- **path**: (repo path)  
- **included_reason**: (why this record is in the pack)  
- **notes**: (must not fabricate approvals beyond record status)

---

## 6. Missing required decision records (must remain visible)

List missing categories and what is expected to satisfy them. Do not omit missing categories.

For each missing item:
- **required_category**:
- **why_missing**: (e.g., “no decision record exists” / “record exists but PROPOSED only”)  
- **expected_record_type_or_title**:  
- **expected_decision_record_id**: (optional; only if already assigned elsewhere; do not invent)  
- **blocking_consequence**: (governance impact; e.g., “pack cannot be COMPLETE”)  
- **notes**:

---

## 7. Completeness status

- **completeness_status**: `COMPLETE (GOVERNANCE) | INCOMPLETE (MISSING REQUIRED DECISIONS) | NOT ASSESSED`  
- **completeness_rationale**: (short, explicit)

---

## 8. Reviewer

- **reviewer**: (role + name) or `NOT AVAILABLE (MOCK/TEST)`  
- **reviewed_at_iso**:

---

## 9. Sign-off status (governance metadata only)

**Important:** Presence of sign-off fields does not imply approvals were executed. Sign-off status must reflect reality.

- **sign_off_status**: `NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)`  
- **sign_off_by**: (role + name) or `NOT AVAILABLE (MOCK/TEST)`  
- **sign_off_at_iso**:  
- **conditions_or_constraints**:

---

## 10. Notes

- **notes**:

