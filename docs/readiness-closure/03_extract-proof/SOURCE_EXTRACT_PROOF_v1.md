## SOURCE_EXTRACT_PROOF_v1 — Readiness-Closure (Wave R / R04)
**Artifact ID:** R04-SOURCE-EXTRACT-PROOF-v1  
**Status:** DRAFT (readiness-closure governance artifact; mock/test mode)  
**Applies to:** Readiness-Closure evidence-closure only (Wave R).  
**Non-goals (binding):** This artifact does **not** run extracts, does **not** implement pipelines, does **not** authorize pilot entry/execution, and does **not** provide join-integrity proof or reconciliation results.

---

## 1. Purpose and scope
This document defines the **source-extract-proof governance requirements** needed before any downstream work (R05 join-integrity proof and R07 reconciliation dry run) can be trusted.

It specifies:
- what source extracts must exist (by type and purpose),
- how extracts are uniquely identified and tied to the locked perimeter,
- the mandatory metadata, checksums, run-identification, and lineage fields required to treat an extract as **trusted input**,
- ownership, approval, storage/handling expectations, and
- the evidence required to claim “extract proof complete” **in mock/test mode** versus the stricter requirements for a future real pilot.

**In scope (R04):**
- governance requirements and templates for extract proof
- an extract manifest structure to record required proof fields
- evidence requirements and approval expectations (placeholders only; no fabricated signatures)

**Out of scope (R04):**
- extracting data from any system (no execution)
- join-integrity measurement and reporting (R05)
- reconciliation measurement and reporting (R07)
- any product feature work or implementation work

---

## 2. Extract-proof principles
These principles are binding for readiness-closure extract proof.

- **No extract is trusted without provenance**: an extract without a perimeter reference, run identifier, and checksum is treated as untrusted.
- **Manual file handling is not equivalent to controlled extraction**: an emailed file, a spreadsheet copy/paste, or an ad-hoc download is **not** considered “controlled” unless it is produced through a defined extraction mechanism with recorded provenance and approvals.
- **Perimeter-locked**: every extract must explicitly reference the locked perimeter record and must declare the scope filters applied (country, legal entity, provider instance, period/run policy, inclusion/exclusion rules).
- **Explicit ownership and approval**: every extract type has an accountable owner role and an approval expectation; no implied approvals.
- **Fail-closed posture**: if required metadata/evidence is missing, the extract cannot be used for join-integrity proof or reconciliation planning.
- **Mock/test is not pilot**: mock/test extract proof must never be presented as real pilot extraction capability or real pilot data handling compliance.
- **Repeatability**: the goal is a reproducible, reviewable method to prove what must exist and what must be evidenced—not to obtain the data.

---

## 3. In-scope source systems
The in-scope systems are the minimum systems referenced by the locked perimeter and Validation Charter validation model.

For the current readiness-closure perimeter (MOCK / SYNTHETIC interpretation):
- **HRIS / workforce system** (e.g., Workday/HRIS): worker identity + job/assignment attributes.
- **Payroll system** (single locked provider/system instance per perimeter): remuneration truth anchor (earning lines + earning codes + payroll run/period metadata).
- **Identity and access management (IAM)** (e.g., Entra ID): access approvals and role governance for any controlled extract handling.

**Conditional / only if explicitly in scope by a superseding scope decision:**
- **Reward / job architecture reference system** (if Methodology evidence requires it and scope lock includes it).

**Binding scope rule:** In-scope systems and extracts are constrained by the perimeter record and may not be expanded by this artifact.

---

## 4. Required extract types
The following extract types must be defined and provable (via metadata + evidence) for the locked perimeter. This slice defines **types and proof requirements only**.

### 4.1 HRIS extract (perimeter-scoped)
**Purpose:** Provide worker identity, assignment, and job attributes for the in-scope population (per perimeter inclusion rules).

Minimum content expectations (by reference to the scope lock record):
- worker identity keys and effective-dating attributes
- legal entity and country context
- job/position identifiers and job attributes required for validation/design
- any pilot-mandatory fields applicable to HRIS domain (as defined in SoT Matrix v1)

### 4.2 Payroll extract (perimeter-scoped; remuneration truth anchor)
**Purpose:** Provide payroll earning lines and payroll context required for remuneration truth anchoring and later reconciliation planning.

Minimum content expectations (by reference to the scope lock record):
- payroll worker identifier(s)
- payroll run identifier and pay period boundaries
- earning lines with earning codes, amounts, currency, and any off-cycle/retro indicators (even if excluded by perimeter policy, the exclusion rule must be evidenceable)

### 4.3 Earning code reference extract (payroll domain)
**Purpose:** Provide the earning code catalog needed to support controlled mapping governance (R06) and reconciliation planning (R07).

### 4.4 Crosswalk / linkage extract(s) (identity join keys)
**Purpose:** Provide the controlled linkage needed to join HRIS identities to payroll identities within the locked perimeter.

**Rule:** Crosswalk must be versioned and treated as a governed artifact (unique mapping expectations must be declared; ambiguous mappings are blockers unless exception-approved later).

### 4.5 Optional reward/job-architecture reference extract (only if in scope)
**Purpose:** Provide job level/grade references required by Methodology v1 evidence, if and only if included in scope.

---

## 5. Required metadata for every extract
Every extract instance (a single produced file/object for a specific run) must record the following metadata fields (either in an extract manifest entry or as controlled metadata attached to the stored object).

### 5.1 Identification and classification
- **extract_id**: stable identifier for the extract instance (see Section 6)
- **extract_type**: HRIS / PAYROLL / EARNING_CODE_REFERENCE / CROSSWALK / REWARD_REFERENCE (as applicable)
- **source_system**: named system family (e.g., HRIS, PAYROLL, IAM, REWARD)
- **source_instance**: the specific system instance/tenant identifier (must match perimeter references where applicable)
- **schema_version**: version of the extract schema/field list definition used for this extract type

### 5.2 Perimeter binding
- **perimeter_reference**: pointer to the locked perimeter artifact ID/path and any governing decision record reference
- **scope_filter_statement**: the exact scope filters applied (human-readable; include enough detail to confirm perimeter adherence)
- **period_covered**: the pay period or effective-date window covered (as applicable)
- **run_scope_policy**: explicit statement of off-cycle/retro policy alignment with perimeter (included/excluded)

### 5.3 Data characteristics (non-sensitive summary)
- **row_count**: number of records/rows/lines in the extract
- **record_grain**: declared grain (e.g., worker, assignment, earning line, earning code)
- **contains_pii**: Yes/No (classification flag; see storage expectations)
- **data_classification**: mock/synthetic vs real/pilot (see Section 9)

### 5.4 Governance fields
- **owner_role**: accountable business owner role (not engineering)
- **steward_role**: operational steward responsible for run discipline and evidence packaging (may be engineering/ops, but not sole approver)
- **approval_reference**: decision/approval record reference (placeholders allowed; no fabricated approvals)

---

## 6. Required checksum / run-identification / lineage fields
Extract proof requires the following run-identification, checksum, and lineage fields to ensure immutability and reproducibility.

### 6.1 Run identifiers
- **run_id**: unique identifier for the extraction run that produced the extract instance
- **generated_at_iso**: timestamp of generation (ISO 8601)
- **producer_identity**: the service account / tool identity used to run the extraction (or “NOT AVAILABLE” in mock/test mode, with explicit gap note)
- **environment_label**: mock/test environment label (e.g., “mock-governance”) or future pilot environment label

### 6.2 Checksums / digests
- **checksum_algorithm**: required algorithm (recommended: SHA-256)
- **checksum_value**: digest of the extract file/object bytes (or object version digest if stored in a system that provides a strong content hash)
- **checksum_generated_at_iso**: timestamp when checksum was computed

**Rule:** A file/object without a checksum is not eligible input for downstream proof work.

### 6.3 Lineage links
- **lineage_reference**: a stable reference to:
  - the perimeter record version,
  - the scope filters used,
  - any crosswalk version used (if applicable),
  - the schema version used for the extract type,
  - and the storage location reference (object path + version id).

**Rule:** Lineage must be sufficient to allow an independent reviewer to answer: “what system, what instance, what scope, what period, what run, what file/object, what checksum?”

---

## 7. Approval and ownership model
R04 defines who owns and who approves extract proof requirements. It does not execute approvals.

### 7.1 Ownership expectations (minimum)
- **Payroll extract(s) + earning code reference**:
  - **Owner role**: Payroll Controls Lead (or equivalent payroll data owner)
- **HRIS extract(s)**:
  - **Owner role**: HRIS / People Data Owner
- **Crosswalk/linkage extract(s)**:
  - **Owner role**: jointly HRIS / People Data Owner + Payroll Controls Lead (or designated master data owner)
- **IAM/access evidence related to extract handling**:
  - **Owner role**: Security Architect + Privacy Lead (for policy); Program Director (for governance coordination)

### 7.2 Approval expectations (mock/test readiness-closure)
For mock/test governance mode, approvals are **placeholders and expectations** only:
- Approval records must be referenced (even if “NOT YET OBTAINED”) with the planned approval path aligned to the Validation Charter authority/veto model.
- No extract should be presented as “pilot-ready” based on mock/test approvals.

### 7.3 Approval expectations (future real pilot; for distinction only)
Real pilot extract proof (outside this slice) requires:
- privacy/security clearance bundles (Validation Charter G4; readiness-closure R13/R14 artifacts),
- explicit data owner approvals per system instance,
- confirmed access model evidence (R15),
- and perimeter approval with real values and VSG sign-off (Validation Charter G1; DR-0003 must be APPROVED with real perimeter values).

---

## 8. Storage and handling expectations
This section defines **handling expectations** for extract artifacts. It does not implement storage systems.

### 8.1 Storage location discipline
- Each extract instance must have a **storage_location_reference** pointing to a controlled storage location.
- Storage references must be **version-aware** (object version id, immutable storage path, or equivalent).
- The repo must not contain real extracts. For mock/test mode, do not commit raw extracts unless they are explicitly synthetic and approved for repository storage by the access baseline (prefer metadata-only references).

### 8.2 Handling rules (non-negotiable)
- No uncontrolled redistribution (email attachments, chat uploads) is treated as “controlled extraction”.
- Any copying/exporting of worker/pay data (even mock) must follow the access baseline expectations (logging, approvals, least privilege).
- If an extract contains PII (or would in a real pilot), it must be treated as sensitive and subject to retention/minimization expectations.

### 8.3 Retention and deletion expectations (governance-only)
- Retention rules are governed by privacy/security bundles (R13/R14) and the Validation Charter.
- This artifact requires that retention expectations be **declared** in the manifest notes or storage reference metadata, even if only as “TBD pending R13/R14”.

---

## 9. Mock/test vs real pilot extract-proof distinction
This section prevents confusion between mock/test governance proof and real pilot proof.

### 9.1 Mock/test extract proof (current readiness-closure mode)
Mock/test extract proof is complete when:
- required extract types are defined and listed,
- manifest entries can be produced with all required metadata fields populated **to the maximum feasible degree**, and
- any fields that cannot be populated without real execution are explicitly marked as gaps (e.g., producer identity, real system instance ids) without substituting fabricated values.

Mock/test extract proof must:
- reference the locked perimeter record (MOCK / SYNTHETIC interpretation),
- explicitly label outputs as mock/test governance-only,
- avoid claims of real data handling compliance.

### 9.2 Real pilot extract proof (future; not executed here)
Real pilot extract proof requires:
- real perimeter values and approval (scope lock approved under charter authority/veto model),
- real system instance identifiers and access approvals,
- controlled extraction run logs,
- checksums computed from produced objects,
- and evidence that extraction method is controlled (not manual file handling).

**Rule:** Nothing in mock/test proof can be used to claim Gate G7 (Data readiness: extracts + join integrity) is passed.

---

## 10. Evidence requirements
R04 evidence requirements are governance-only and do not fabricate results.

### 10.1 Evidence artifacts required for “extract proof ready”
- `SOURCE_EXTRACT_PROOF_v1.md` (this document)
- `EXTRACT_MANIFEST_TEMPLATE_v1.md` (template structure)
- Perimeter reference: `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md` (MOCK / SYNTHETIC interpretation)
- Decision-log reference(s): `docs/readiness-closure/01_decision-log/DECISION_LOG.md` (and DR-0003 status)
- Access baseline references: `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md` and `RBAC_MATRIX_v1.md`

### 10.2 Evidence standards for downstream eligibility (what R04 must enable, not execute)
R04 must enable a reviewer to verify, for each required extract instance:
- it is tied to the locked perimeter,
- it has a run identifier and generated timestamp,
- it has a strong checksum,
- it has a declared schema version and row count,
- it has explicit owner role and an approval reference (or an explicit “not yet approved” status),
- and it has a controlled storage location reference.

### 10.3 Prohibited evidence behaviors
- Do not commit real extracts to the repo.
- Do not fabricate checksums, row counts, approvals, or run logs.
- Do not claim join integrity, reconciliation, or gate passage based on documentation alone.

---

## 11. References to governing artifacts
- Authoritative execution queue and status: `.claude/SLICE_QUEUE.md` (Wave R; R04)
- Readiness-Closure phase definition and non-goals: `docs/readiness-closure/README.md`
- Validation authority model + veto rights + gates (G1/G4/G7): `docs/validation/VALIDATION_CHARTER_v1.md`
- Locked perimeter record (MOCK / SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Readiness-closure decision log discipline (append-only): `docs/readiness-closure/01_decision-log/DECISION_LOG.md`
- Access model baseline + RBAC governance:  
  - `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md`  
  - `docs/readiness-closure/13_access-model/RBAC_MATRIX_v1.md`

