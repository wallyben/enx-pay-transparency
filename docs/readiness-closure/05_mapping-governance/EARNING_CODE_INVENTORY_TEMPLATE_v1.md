## EARNING_CODE_INVENTORY_TEMPLATE_v1 — Readiness-Closure (Wave R / R06)

**Artifact ID:** R06-EARNING-CODE-INVENTORY-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does not execute mapping, does not certify pilot readiness, and does not replace required approvals.

---

## How to use (governance-only)

- Create **one entry per earning code per payroll provider instance** (do not assume codes are globally unique).
- Populate all fields. If a field cannot be populated in mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Every entry must include an explicit `mapping_status`, `mapping_version`, and `approval_status`.
- If the code is used for an in-scope remuneration component and is not fully governed, set `blocker_flag = YES` and explain in `notes`.

---

## Inventory entry template (copy/paste per earning code)

- **earning_code**: `<<string>>`  _(required)_
- **earning_code_description**: `<<string>>`  _(required; use payroll description if available)_
- **source_payroll_provider**: `<<string>>`  _(required; provider family/name)_
- **source_instance**: `<<string>>`  _(required; tenant/instance identifier)_
- **in_scope_perimeter_reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)`  _(required; add DR reference if applicable)_

- **component_family_candidate**: `<<BASE_PAY | VARIABLE_PAY | ALLOWANCE_OR_ONE_TIME | BENEFIT_IN_KIND | REIMBURSEMENT_NON_PAY | DEDUCTION_NON_REMUNERATION | TAX_OR_STATUTORY | OTHER_UNCERTAIN>>`  _(required)_

- **mapping_status**: `<<UNREVIEWED | MAPPED_APPROVED | MAPPED_PROVISIONAL | UNMAPPED | MISCLASSIFICATION_SUSPECTED | OUT_OF_SCOPE>>`  _(required)_
- **mapping_version**: `<<MAP-EC-YYYYMMDD-vX.Y>>`  _(required; must reference a locked version when used for downstream truth)_

- **owner_role**: `<<Payroll Controls Lead | Reward Owner | ...>>`  _(required; role not individual)_
- **approval_status**: `<<NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED>>`  _(required)_

- **blocker_flag**: `<<YES | NO>>`  _(required; YES for in-scope UNMAPPED / MISCLASSIFICATION_SUSPECTED / missing version / instance mismatch / inventory gap conditions)_

- **notes**: `<<free text>>`  _(required; include ambiguity, scope exclusions, gaps, next steps; do not embed real payroll rows)_
- **evidence_reference**: `<<pointer(s) to controlled evidence; do not fabricate>>`  _(required; e.g., payroll code catalog doc, config export ref, decision record ref)_

---

## Optional (recommended) normalization fields

These are optional in the minimum R06 template, but recommended if the inventory will be used for structured filtering and evidence packaging:

- **earning_code_type**: `<<EARNING | DEDUCTION | TAX | OTHER>>`
- **effective_start_date**: `<<YYYY-MM-DD>>`
- **effective_end_date**: `<<YYYY-MM-DD | NULL>>`
- **currency_scope**: `<<EUR | MULTI | NOT_APPLICABLE>>`
- **units_type**: `<<HOURS | UNITS | AMOUNT_ONLY | OTHER>>`
- **observed_in_run_reference**: `<<extract_id/run_id reference (outside repo) or NOT AVAILABLE (MOCK/TEST)>>`

---

## Table form (optional rendering)

If you prefer tabular entry, use this header row (copy/paste and add rows below):

| earning_code | earning_code_description | source_payroll_provider | source_instance | in_scope_perimeter_reference | component_family_candidate | mapping_status | mapping_version | owner_role | approval_status | blocker_flag | notes | evidence_reference |
|---|---|---|---|---|---|---|---|---|---|---|---|---|

