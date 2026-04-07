---
title: "ACCESS_MODEL_EVIDENCE_PACK_TEMPLATE_v1 — Readiness-Closure (Wave R / R15)"
template_id: "R15-ACCESS-MODEL-EVIDENCE-PACK-TEMPLATE-v1"
status: "TEMPLATE (governance-only; mock/test readiness-closure mode)"
non_goals_binding:
  - "Does not implement IAM, grant access, or collect real access logs."
  - "Does not issue or imply real approvals or pilot authorization."
  - "Does not authorize pilot entry or pilot execution."
---

## How to use (governance-only)

- Create **one access-model evidence pack** per perimeter and review attempt.
- Populate all fields below.
- If a field cannot be populated in mock/test readiness-closure mode, set it to `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Keep required sections present even if empty; use `missing_sections` to keep gaps visible.

## Access model evidence pack template (copy/paste)

### A) Pack header (identity)
- **pack_id**: `<<R15-AMEP-YYYYMMDD-###>>`
- **pack_version**: `v1`
- **created_at_iso**: `<<YYYY-MM-DDTHH:MM:SSZ>>`
- **prepared_by**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
- **mode**: `<<MOCK/TEST GOVERNANCE ONLY | REAL PILOT EVIDENCE>>`

### B) Perimeter binding (scope reference)
- **perimeter_reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`
- **perimeter_interpretation**: `<<MOCK/SYNTHETIC | REAL>>`
- **scope_notes**: `<<must not broaden scope silently>>`

### C) Governance baseline references (required)
- **access_model_reference**: `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md (R03-ACCESS-MODEL-BASELINE)`
- **rbac_matrix_reference**: `docs/readiness-closure/13_access-model/RBAC_MATRIX_v1.md (R03-RBAC-MATRIX-v1)`
- **access_evidence_governance_reference**: `docs/readiness-closure/13_access-model/ACCESS_MODEL_EVIDENCE_v1.md (R15-ACCESS-MODEL-EVIDENCE-v1)`

### D) Role assignment evidence (membership; NOT approval)
> This section records **who is assigned to which role(s)**. Do not treat it as approval evidence.

- **role_assignment_evidence_reference**: `<<membership system record / group export reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **role_assignments_summary**: `<<short summary of roles covered and effective dates OR NOT AVAILABLE (MOCK/TEST)>>`
- **role_assignment_entries** (repeat per membership change; references only; no personal data beyond role+name where permitted):
  - **subject**: `<<role + name OR synthetic identity>>`
  - **assigned_roles**: `<<one or more baseline roles>>`
  - **effective_start**: `<<YYYY-MM-DD>>`
  - **effective_end_or_review_by**: `<<YYYY-MM-DD OR NOT AVAILABLE (MOCK/TEST)>>`
  - **assignment_type**: `<<NEW | RENEWAL | REVOCATION | MODIFICATION>>`
  - **scope**: `<<artifact set + data class>>`
  - **evidence_reference**: `<<pointer to membership record/ticket OR NOT AVAILABLE (MOCK/TEST)>>`

### E) Approval evidence (authorizes role assignments / elevated privileges)
> This section records **who approved** the access and why. It must be distinguishable from role assignment evidence.

- **approval_evidence_reference**: `<<approval record system pointer OR NOT AVAILABLE (MOCK/TEST)>>`
- **approval_entries** (repeat per approval decision):
  - **requestor**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
  - **requested_roles_or_privileges**: `<<roles/privileges requested>>`
  - **purpose**: `<<mapped to readiness-closure work item(s)>>`
  - **scope**: `<<artifact set + data class + duration>>`
  - **approvers**: `<<role + name list OR NOT AVAILABLE (MOCK/TEST)>>`
  - **outcome**: `<<APPROVED | REJECTED | PENDING | NOT AVAILABLE (MOCK/TEST)>>`
  - **timestamp_iso**: `<<YYYY-MM-DDTHH:MM:SSZ OR NOT AVAILABLE (MOCK/TEST)>>`
  - **expiry_or_review_by**: `<<YYYY-MM-DD OR NOT AVAILABLE (MOCK/TEST)>>`
  - **sod_check**:
    - **checked_by**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
    - **result**: `<<PASS | FAIL | EXCEPTION | NOT AVAILABLE (MOCK/TEST)>>`
    - **exception_reference**: `<<reference if EXCEPTION>>`
  - **evidence_reference**: `<<pointer to approval artifact OR NOT AVAILABLE (MOCK/TEST)>>`

### F) Logging evidence (expectations + evidence pointers)
- **logging_expectations_reference**: `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md (Section 8 Logging and audit expectations)`
- **logging_evidence_reference**: `<<log export / audit query / screenshot pointer OR NOT AVAILABLE (MOCK/TEST)>>`
- **logging_fields_expected**: `actor_identity, timestamp, action, target_resource, data_class, outcome, purpose_or_work_item_ref`
- **logging_gaps**: `<<explicit list of missing logging evidence items>>`

### G) Recertification evidence (expectations + evidence pointers)
- **recertification_expectations_reference**: `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md (Section 9 Review and recertification expectations)`
- **recertification_schedule**:
  - **cadence**: `<<MONTHLY | QUARTERLY | OTHER>>`
  - **next_due_date**: `<<YYYY-MM-DD OR NOT AVAILABLE (MOCK/TEST)>>`
- **recertification_evidence_reference**: `<<review record pointer OR NOT AVAILABLE (MOCK/TEST)>>`
- **recertification_outcomes_summary**: `<<renewed/revoked/pending counts OR NOT AVAILABLE (MOCK/TEST)>>`
- **recertification_exceptions**: `<<explicit list (if any)>>`

### H) Break-glass evidence (exceptional access; auditable)
- **break_glass_policy_reference**: `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md (Section 7 Break-glass rules)`
- **break_glass_evidence_reference**: `<<event register/log/ticket reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **break_glass_events_summary**: `<<count + high-level description OR NOT AVAILABLE (MOCK/TEST)>>`
- **break_glass_event_fields_expected**: `reason_code, scope, duration/expiry, approver, notifications, timestamps, after_action_review_outcome`
- **break_glass_oversight_reference**: `<<after-action review record pointer OR NOT AVAILABLE (MOCK/TEST)>>`

### I) Separation-of-duties (SoD) evidence
- **sod_rules_reference**: `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md (Section 10 Separation-of-duties expectations)`
- **sod_assessment_summary**: `<<PASS | FAIL | EXCEPTION(S) | NOT AVAILABLE (MOCK/TEST)>>`
- **sod_exception_register_reference**: `<<reference OR NOT AVAILABLE (MOCK/TEST)>>`
- **sod_exceptions** (repeat if any):
  - **exception_id**: `<<R15-SOD-EXC-YYYYMMDD-###>>`
  - **rule_violated**: `<<which baseline SoD rule>>`
  - **rationale**: `<<why unavoidable>>`
  - **time_bound_until**: `<<YYYY-MM-DD>>`
  - **compensating_controls**: `<<e.g., additional audit log review>>`
  - **approval_reference**: `<<reference OR NOT AVAILABLE (MOCK/TEST)>>`

### J) Reviewer / sign-off placeholders (governance-only)
- **reviewer**: `<<role + name OR NOT AVAILABLE (MOCK/TEST)>>`
- **review_date**: `<<YYYY-MM-DD OR NOT AVAILABLE (MOCK/TEST)>>`
- **sign-off status**: `<<NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT AVAILABLE (MOCK/TEST)>>`
- **sign-off_conditions**: `<<explicit conditions required before any approval could be granted>>`

### K) Completeness assessment (objective)
- **completeness status**: `<<COMPLETE (GOVERNANCE) | INCOMPLETE (MISSING REQUIRED SECTIONS) | NOT ASSESSED>>`
- **completeness_status_reason**: `<<short, specific>>`
- **missing sections**: `<<explicit list (e.g., approval evidence reference missing; logging evidence missing; recert evidence missing)>>`
- **notes**: `<<anything a reviewer must know; no personal data; no secrets>>`

#### Completeness checklist (minimum; required)
- [ ] pack_id present
- [ ] perimeter reference present + interpretation labeled (MOCK/SYNTHETIC vs REAL)
- [ ] access model reference present
- [ ] RBAC matrix reference present
- [ ] role assignment evidence section present
- [ ] approval evidence section present
- [ ] logging evidence section present + baseline linkage
- [ ] recertification evidence section present + cadence linkage
- [ ] break-glass evidence section present + baseline linkage
- [ ] SoD evidence section present (includes exception handling fields)
- [ ] reviewer and sign-off fields present (even if NOT AVAILABLE (MOCK/TEST))
- [ ] missing sections explicitly listed (do not remove required sections)

