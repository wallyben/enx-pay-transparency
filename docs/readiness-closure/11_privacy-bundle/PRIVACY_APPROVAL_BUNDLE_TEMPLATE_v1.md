---
title: "PRIVACY_APPROVAL_BUNDLE_TEMPLATE_v1 — Readiness-Closure (Wave R / R13)"
template_id: "R13-PRIVACY-APPROVAL-BUNDLE-TEMPLATE-v1"
status: "TEMPLATE (governance-only; mock/test readiness-closure mode)"
non_goals_binding:
  - "Does not complete a DPIA or issue privacy approval."
  - "Does not authorize pilot entry or pilot execution."
  - "Does not introduce real personal data."
---

## How to use (governance-only)

- Create one privacy approval bundle instance per perimeter and review attempt.
- Populate all fields below.
- If a field cannot be populated in mock/test readiness-closure mode, set it to `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Do not embed worker-level personal data in this repo. Use references/pointers and digests to controlled storage where needed.

## Privacy approval bundle template (copy/paste)

### A) Bundle header (identity)
- **bundle_id**: `<<R13-PAB-YYYYMMDD-###>>`
- **bundle_version**: `v1`
- **created_at_iso**: `<<YYYY-MM-DDTHH:MM:SSZ>>`
- **prepared_by**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
- **mode**: `<<MOCK/TEST GOVERNANCE ONLY | REAL PILOT EVIDENCE>>`

### B) Perimeter binding (scope reference)
- **perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`
- **perimeter_interpretation**: `<<MOCK/SYNTHETIC | REAL>>`
- **scope_notes**: `<<must not broaden scope silently>>`

### C) Purpose, lawful basis, and DPIA / assessment references
- **purpose statement**: `<<single, explicit purpose>>`
- **lawful basis reference**: `<<internal lawful basis determination reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **risk_assessment_reference (e.g., DPIA)**: `<<reference/status OR NOT AVAILABLE (MOCK/TEST)>>`

### D) Data inventory (categories + special category assessment)
- **data categories in scope**: `<<high-level categories (identity, employment, job, pay, etc.)>>`
- **data_categories_inventory_reference**: `docs/data-governance/SOURCE_OF_TRUTH_MATRIX_v1.md (and/or CSV/JSON)` + `<<version marker>>`
- **special category assessment**:
  - **special_category_data_present**: `<<YES | NO | UNKNOWN (MOCK/TEST)>>`
  - **special_category_notes**: `<<if YES, what categories and why; if NO, confirm posture; if UNKNOWN, state blocker>>`

### E) Minimization (field necessity; SoT link required)
- **minimization assessment reference**: `<<reference OR inline summary>>`
- **minimization_check**:
  - **fields_in_scope_canonical**: `<<list canonical field names from SoT Matrix v1 (preferred) OR NOT AVAILABLE (MOCK/TEST)>>`
  - **fields_excluded_explicitly**: `<<list excluded fields/categories (no silent omission)>>`
  - **necessity_rationale**: `<<why each field group is necessary for purpose>>`
  - **minimization_blockers**: `<<list blockers (e.g., field requested not in SoT matrix)>>`

### F) Retention and deletion
- **retention schedule reference**: `<<reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **retention_summary**: `<<expected retention window(s) and rationale>>`
- **deletion approach reference**: `<<reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **deletion_summary**:
  - **deletion_trigger**: `<<e.g., after run, end of readiness-closure, end of pilot>>`
  - **deletion_scope**: `<<raw extracts, derived artifacts, exports>>`
  - **deletion_evidence_expected**: `<<log/ticket/attestation reference expectation>>`

### G) Access, recipients, and disclosures (access model link required)
- **recipient/access model reference**:
  - `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md (R03-ACCESS-MODEL-BASELINE)`
  - `docs/readiness-closure/13_access-model/RBAC_MATRIX_v1.md (R03-RBAC-MATRIX-v1)`
- **recipients_in_scope**: `<<roles/groups/functions who can access>>`
- **access_approval_reference**: `<<approval record reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **logging_expectations_reference**: `<<reference OR NOT AVAILABLE (MOCK/TEST)>>`

### H) Storage / location and transfer considerations
- **storage/location reference**: `<<where data is stored/processed; region/environment classification; reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **transfer assessment reference**: `<<transfer assessment reference/status OR NOT AVAILABLE (MOCK/TEST)>>`
- **transfer_notes**: `<<cross-border transfer posture; explicit unknowns>>`

### I) Review and sign-off placeholders (no approvals executed in R13)
- **reviewer**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
- **review_date**: `<<YYYY-MM-DD OR NOT AVAILABLE (MOCK/TEST)>>`
- **sign-off status**: `<<NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)>>`
- **sign-off_conditions**: `<<explicit conditions required before any approval could be granted>>`

### J) Completeness assessment (objective)
- **completeness status**: `<<COMPLETE (GOVERNANCE) | INCOMPLETE (MISSING REQUIRED SECTIONS) | NOT ASSESSED>>`
- **missing_sections**: `<<explicit list>>`
- **completeness_rationale**: `<<short, specific>>`
- **completeness_checklist**:
  - [ ] bundle_id present
  - [ ] perimeter reference present + interpretation labeled (MOCK/SYNTHETIC vs REAL)
  - [ ] purpose statement present
  - [ ] lawful basis reference present (or explicit mock/test placeholder)
  - [ ] data categories inventory reference present (SoT link)
  - [ ] special category assessment present
  - [ ] minimization check present (includes canonical field references)
  - [ ] retention schedule reference present
  - [ ] deletion approach reference present
  - [ ] recipient/access model reference present (R03 baseline + RBAC)
  - [ ] storage/location reference present
  - [ ] transfer assessment reference present
  - [ ] reviewer and sign-off fields present (even if NOT AVAILABLE (MOCK/TEST))

### K) Notes (required)
- **notes**: `<<anything a reviewer must know; no personal data>>`
