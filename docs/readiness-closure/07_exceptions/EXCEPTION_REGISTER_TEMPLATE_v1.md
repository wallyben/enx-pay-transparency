# EXCEPTION_REGISTER_TEMPLATE_v1 — Readiness-Closure (Wave R / R08)
**Artifact ID:** R08-EXCEPTION-REGISTER-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does not execute exception handling, does not certify pilot readiness, and does not replace required approvals.

---

## How to use (governance-only)
- Create one register entry per exception identified in any readiness-closure artifact output (join integrity, mapping governance, reconciliation, confidence gating design outputs, methodology governance exceptions).
- Populate every required field.
- If a field cannot be populated in mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Do not embed sensitive worker-level drill-down rows in this repo. Use stable, access-controlled pointers for evidence and drill-down.
- The register is **append-only**: do not delete or rewrite prior entries; use status transitions and evidence updates.

---

## Exception register entry template (copy/paste)

- **exception_id**: `<<R08-EXC-YYYYMMDD-###>>`

- **perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`

- **source artifact reference**: `<<path + report_id/section pointer (e.g., R05 join report id; R07 recon report id)>>`

- **exception code**: `<<preferred: code from docs/reconciliation/exception-taxonomy_v1.json; else local code with justification>>`

- **exception title**: `<<short, specific>>`

- **exception description**: `<<what happened; perimeter-bound context; no sensitive rows>>`

- **severity**: `<<CRITICAL | HIGH | MEDIUM | LOW>>`

- **blocker_flag**: `<<true | false>>`

- **owner_role**: `<<payroll_controls_owner | hris_people_data_owner | reward_methodology_owner | internal_audit_assurance_lead | legal_counsel | privacy_lead | security_lead | data_engineering_intake_owner | other (must justify)>>`

- **opened_date**: `<<YYYY-MM-DD>>`

- **current_status**: `<<OPEN | UNDER_REVIEW | CLOSED>>`

- **disposition_status**: `<<OPEN | UNDER_REVIEW | EXPLAINED | ACCEPTED_EXCEPTION | REQUIRES_RERUN | CLOSED>>`

- **resolution_required**: `<<true | false>>` (if `false`, must be supported by `ACCEPTED_EXCEPTION` disposition + approvals)

- **related_reconciliation_report**: `<<R07 reconciliation report reference or NOT AVAILABLE (MOCK/TEST)>>`

- **related_join_report**: `<<R05 join integrity report reference or NOT AVAILABLE (MOCK/TEST)>>`

- **related_confidence_output**: `<<confidence output/gate evaluation reference or NOT AVAILABLE (MOCK/TEST)>>`

- **related_mapping_version**: `<<mapping version id / lock record reference or NOT AVAILABLE (MOCK/TEST)>>`

- **evidence_reference**: `<<stable pointer(s): artifact path, report ids, digests, access-controlled location pointers>>`

- **reviewer**: `<<reviewer role + name OR NOT AVAILABLE (MOCK/TEST)>>`

- **sign-off_status**: `<<NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)>>`

- **notes**: `<<status transition notes, escalation notes, rationale, decision record references; no sensitive rows>>`

---

## Field checklist (minimum required fields)

The following fields are mandatory for every entry (must not be blank):
- `exception_id`
- `perimeter reference`
- `source artifact reference`
- `exception code`
- `exception title`
- `exception description`
- `severity`
- `blocker_flag`
- `owner_role`
- `opened_date`
- `current_status`
- `disposition_status`
- `resolution_required`
- `related_reconciliation_report` (or `NOT AVAILABLE (MOCK/TEST)`)
- `related_join_report` (or `NOT AVAILABLE (MOCK/TEST)`)
- `related_confidence_output` (or `NOT AVAILABLE (MOCK/TEST)`)
- `related_mapping_version` (or `NOT AVAILABLE (MOCK/TEST)`)
- `evidence_reference` (or `NOT AVAILABLE (MOCK/TEST)` with explanation in notes)
- `reviewer` (or `NOT AVAILABLE (MOCK/TEST)`)
- `sign-off_status`
- `notes` (may be empty only if all other fields fully explain the exception)

