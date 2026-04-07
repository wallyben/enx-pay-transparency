# JOIN_INTEGRITY_REPORT_TEMPLATE_v1 — Readiness-Closure (Wave R / R05)
**Artifact ID:** R05-JOIN-INTEGRITY-REPORT-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does not execute joins, does not certify pilot readiness, and does not replace required approvals.

---

## How to use (governance-only)
- Create **one report per join path evaluated** (or per join path per run/perimeter if segmentation is required).
- Populate all fields. If a field cannot be populated in mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Every report must reference the locked perimeter record and the source artifacts used (extract manifests and any controlled crosswalk artifacts).
- If exceptions are generated outside the repo, include stable references (location + digest + access-controlled pointer) rather than embedding sensitive rows.

---

## Join integrity report template (copy/paste)

- **report_id**: `<<R05-JOIN-REPORT-YYYYMMDD-###>>`

- **perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`

- **source artifacts referenced**:
  - `<<extract_id + manifest reference for left input>>`
  - `<<extract_id + manifest reference for right input>>`
  - `<<crosswalk artifact id/version reference (if used)>>`

- **join path evaluated**: `<<HRIS worker ↔ payroll worker | HRIS legal entity ↔ payroll legal entity | HRIS assignment ↔ payroll worker-period context | (other, must be justified)>>`

- **join keys used**:
  - **left entity**: `<<HRIS_WORKER | HRIS_LEGAL_ENTITY | HRIS_ASSIGNMENT | ...>>`
  - **right entity**: `<<PAYROLL_WORKER | PAYROLL_LEGAL_ENTITY | PAYROLL_WORKER_PERIOD | ...>>`
  - **left key fields**: `<<field list>>`
  - **right key fields**: `<<field list>>`
  - **expected grain**: `<<worker | assignment | earning_line | legal_entity | period_context>>`
  - **expected cardinality**: `<<1:1 | 1:many | many:1 | many:many>>`
  - **crosswalk used**: `<<YES/NO>>` (if YES: `<<crosswalk id/version>>`)

- **input record counts**:
  - **total left records**: `<<integer>>`
  - **total right records**: `<<integer>>`

- **matched record counts**:
  - **matched record counts**: `<<integer>>`

- **unmatched-left count**: `<<integer>>`
- **unmatched-right count**: `<<integer>>`
- **duplicate-key count**: `<<integer>>` (declare side(s) impacted in notes or exception references)
- **ambiguous-match count**: `<<integer>>`

- **join integrity percentage**:
  - **value**: `<<number (0–100)>>`
  - **denominator policy**: `<<LEFT_ANCHORED | RIGHT_ANCHORED | SYMMETRIC>>`
  - **formula statement**: `<<e.g., matched / total_left>>`

- **threshold result**:
  - **threshold applied**: `<<e.g., >= 99.0%>>`
  - **result**: `<<PASS/FAIL>>`

- **blocker / warning result**:
  - **result**: `<<BLOCKER | WARNING | NONE>>`
  - **reason summary**: `<<e.g., ambiguous identity join; duplicate keys on mandatory path; below threshold>>`

- **related exception codes**: `<<list taxonomy labels used (e.g., DUPLICATE_KEY_LEFT, ORPHAN_RIGHT, AMBIGUOUS_MATCH, CROSSWALK_NON_UNIQUE, EFFECTIVE_DATING_OVERLAP)>>`

- **owner**: `<<owner role + name>>`
- **review date**: `<<YYYY-MM-DD>>`
- **notes**: `<<perimeter caveats, known constraints, drill-down references, mock/test labels, any non-populated fields explained>>`

