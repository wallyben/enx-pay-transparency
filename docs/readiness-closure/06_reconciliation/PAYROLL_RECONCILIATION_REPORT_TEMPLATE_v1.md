# PAYROLL_RECONCILIATION_REPORT_TEMPLATE_v1 — Readiness-Closure (Wave R / R07)
**Artifact ID:** R07-PAYROLL-RECONCILIATION-REPORT-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does not execute reconciliation, does not certify pilot readiness, and does not replace required approvals.

---

## How to use (governance-only)
- Create **one report per reconciliation domain + comparison level** (or further segmented per perimeter/run if required).
- Populate all fields. If a field cannot be populated in mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Every report must reference:
  - the locked perimeter record, and
  - the controlled mapping version lock (where remuneration components are mapped), and
  - the source extract manifest references used.
- Do not embed sensitive worker-level rows in this repo. Use stable, access-controlled pointers for drill-down evidence.

---

## Reconciliation report template (copy/paste)

- **report_id**: `<<R07-RECON-REPORT-YYYYMMDD-###>>`

- **perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`

- **mapping version reference**: `<<mapping version id>>` + `docs/readiness-closure/05_mapping-governance/MAPPING_VERSION_LOCK_v1.md` + `<<lock record reference or NOT AVAILABLE (MOCK/TEST)>>`

- **source extract references**:
  - `<<payroll extract manifest reference(s): extract_id + manifest pointer>>`
  - `<<HRIS extract manifest reference(s): extract_id + manifest pointer (if used)>>`
  - `<<earning code reference extract manifest reference(s) (if used)>>`
  - `<<crosswalk/linkage artifact reference(s) (if used)>>`

- **reconciliation domain**: `<<base_pay | variable_pay_bonus | included_component_family_totals | worker_period_totals | entity_period_aggregate_totals | excluded_policy_effect>>`

- **comparison level**: `<<worker-period | component family | entity/period aggregate | run-level summary>>`

- **expected source-of-truth total**: `<<number>>` (payroll-anchored expected total for the domain/level; include currency context in notes)

- **observed system total**: `<<number>>` (controlled system representation total for the same domain/level)

- **variance amount**: `<<number>>` (observed - expected; declare sign convention in notes if needed)

- **variance percentage**: `<<number>>` (percent difference under the declared denominator policy; define in notes)

- **tolerance applied**: `<<e.g., abs <= 0.01 OR pct <= 0.1%>>` (explicit; reference SoT Matrix tolerance precedence where applicable)

- **threshold result**: `<<PASS | FAIL>>`

- **blocker / warning result**: `<<BLOCKER | WARNING | NONE>>`

- **related exception codes**: `<<list codes from docs/reconciliation/exception-taxonomy_v1.json>>`

- **disposition status**: `<<OPEN | UNDER_REVIEW | EXPLAINED | ACCEPTED_EXCEPTION | REQUIRES_RERUN | CLOSED>>`

- **owner**: `<<owner role + name>>`

- **reviewer**: `<<reviewer role + name>>`

- **sign-off status**: `<<NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT_AVAILABLE (MOCK/TEST)>>`

- **notes**: `<<drill-down pointers, key assumptions, rounding/tolerance details, mock/test label, non-populated fields explained; do not embed sensitive rows>>`

