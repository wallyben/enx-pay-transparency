## EXTRACT_MANIFEST_TEMPLATE_v1 — Readiness-Closure (Wave R / R04)
**Artifact ID:** R04-EXTRACT-MANIFEST-TEMPLATE-v1  
**Status:** TEMPLATE (governance-only; mock/test readiness-closure mode)  
**Non-goals (binding):** This template does not execute extraction, does not certify pilot readiness, and does not replace required approvals.

---

## How to use (governance-only)
- Create **one manifest entry per extract instance** (one file/object produced by one run).
- Populate all fields. If a field cannot be populated in mock/test governance mode, use `NOT AVAILABLE (MOCK/TEST)` and explain in `notes` (do not fabricate values).
- Every entry must reference the locked perimeter record and the relevant decision/approval references.

---

## Manifest entry template (copy/paste per extract instance)

- **extract_id**: `<<R04-EXTRACT-YYYYMMDD-###>>`
- **source_system**: `<<HRIS | PAYROLL | REWARD | IAM | OTHER>>`
- **source_instance**: `<<tenant/instance identifier; must align to locked perimeter where applicable>>`
- **perimeter reference**: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md (R02-PILOT-SCOPE-LOCK; MOCK/SYNTHETIC interpretation)` + `<<DR reference if applicable>>`
- **extract purpose**: `<<why this extract exists; what downstream proof it supports>>`
- **period covered**: `<<YYYY-MM-DD to YYYY-MM-DD, or effective-date window, or N/A for reference extracts>>`
- **run identifier**: `<<run_id>>` (and optionally `<<job/workflow id>>`)
- **generated timestamp**: `<<ISO 8601 timestamp>>`
- **file name / object name**: `<<file name or object key>>`
- **checksum/hash**: `<<algorithm:value>>` (recommended `sha256:<hex>`)
- **row count**: `<<integer>>`
- **schema version**: `<<extract schema/field-list version>>`
- **owner**: `<<accountable owner role>>`
- **approval reference**: `<<approval record reference or NOT YET OBTAINED>>`
- **storage location reference**: `<<controlled storage pointer + version id; not the repo>>`
- **lineage reference**: `<<links: scope filters applied + perimeter reference + crosswalk version (if used) + upstream identifiers>>`
- **notes**: `<<any scope exclusions (off-cycle/retro), known gaps, mock/test label, handling constraints>>`

