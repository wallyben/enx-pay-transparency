# ACCESS_MODEL_EVIDENCE_v1 — Readiness-Closure (Wave R / R15)
**Artifact ID:** R15-ACCESS-MODEL-EVIDENCE-v1  
**Status:** DRAFT (governance-only; mock/test readiness-closure mode)  
**Applies to:** Wave R — Readiness-Closure (evidence-closure; governance/program-control only)  
**Non-goals (binding):** This artifact does **not** implement IAM, does **not** grant access, does **not** collect real access logs, does **not** claim security/privacy clearance, and does **not** authorize pilot entry or pilot execution.

---

## 1. Purpose and scope

This document defines the **access-model evidence governance requirements** for readiness-closure so the project has a defined, reviewable structure for evidencing:
- access approvals,
- role assignments and membership changes,
- logging/audit expectations and how they are evidenced,
- recertification expectations and evidence,
- break-glass oversight and evidence,
- separation-of-duties (SoD) expectations and evidence,
- completeness and sign-off expectations for an access evidence pack.

**In scope (R15):**
- Evidence governance definition and completeness rules for access-model readiness closure.
- Required sections for an **Access Model Evidence Pack** and how each section is represented.
- Review/sign-off placeholders and objective completeness assessment.
- Explicit **MOCK/TEST vs real pilot** distinction.

**Out of scope (R15):**
- Implementing any IAM/RBAC enforcement, SSO integration, provisioning workflow, or access tooling.
- Performing access reviews, executing approvals, issuing access grants/revocations, or producing real log exports.
- Authorizing pilot execution or any use of real employee data (pilot entry remains prohibited until R17 passes).

---

## 2. Access-evidence principles

The following principles are binding for access evidence governance during readiness-closure:

- **Explicit and reviewable**: every access-control claim must map to a named evidence section with structured fields (not narrative-only).
- **Perimeter-bound**: every evidence pack must reference the locked perimeter record; evidence cannot silently broaden scope.
- **Role assignment is not approval**: membership evidence (who is in what role) must be distinguishable from approval evidence (who authorized it).
- **Logging expectations are baseline-linked**: logging/audit evidence must explicitly link to the access baseline’s “what must be logged” expectations.
- **Break-glass is exceptional**: break-glass events must remain time-bounded, explicitly approved, logged, and after-action reviewed (evidence must support this).
- **SoD is evidenced, not assumed**: SoD compliance must be asserted with explicit evidence or flagged as an exception with compensating controls.
- **Missing sections remain visible**: required sections must never be removed; incompleteness must be declared and listed.
- **Mock/test is not pilot clearance**: mock/test governance artifacts do not constitute real pilot access approvals or real access control evidence.

---

## 3. Required access evidence sections

An **Access Model Evidence Pack** must contain the sections below. If a section cannot be populated in mock/test readiness-closure mode, it must still be present and marked as `NOT AVAILABLE (MOCK/TEST)` with an explicit gap statement (no fabrication).

1. **Pack header (identity + mode)**
2. **Perimeter binding (scope reference)**
3. **Access model reference (baseline)**
4. **RBAC matrix reference**
5. **Role assignment evidence** (membership list/change records)
6. **Approval evidence** (approvals authorizing assignments and elevated privileges)
7. **Logging/audit evidence** (expectations + evidence pointers)
8. **Recertification evidence** (cadence + review outcomes or placeholders)
9. **Break-glass evidence** (governance + event record placeholders)
10. **Separation-of-duties (SoD) evidence** (checks + exceptions)
11. **Review and sign-off** (reviewer, status, conditions)
12. **Completeness assessment** (status, missing sections, rationale)

---

## 4. Role assignment and approval expectations

### 4.1 Distinguish assignments vs approvals (required)

The evidence pack must represent the following as separate, linkable items:
- **Role assignment evidence**: who is a member of which role(s), with start/end (or review date), scope notes, and evidence pointer(s).
- **Approval evidence**: who approved the assignment and why, aligned to the access baseline approval model.

**Binding rule:** A role assignment entry without an approval reference (or explicit “approval not yet obtained” placeholder) is treated as **incomplete** for real pilot readiness, and must remain visible as missing evidence in mock/test mode.

### 4.2 Minimum fields for role assignment evidence

Each role membership entry should include:
- **subject**: role + name (or synthetic identity in mock/test)
- **assigned_role(s)**: one or more baseline roles
- **effective_start** and **effective_end** (or **review_by_date**)
- **scope**: artifact set and/or dataset class (governance-only; do not grant real access here)
- **assignment_type**: `NEW | RENEWAL | REVOCATION | MODIFICATION`
- **evidence_reference**: pointer to the system record / ticket / decision record (or `NOT AVAILABLE (MOCK/TEST)`)

### 4.3 Minimum fields for approval evidence

Each approval record reference should include:
- **requestor** (role + name)
- **approver(s)** (role + name) and **approval outcome**
- **purpose** (mapped to a readiness-closure work item, e.g., R15 evidence preparation)
- **scope** (what role(s) and what artifact/data class)
- **SoD check statement** (who checked; outcome; exception if any)
- **timestamp** and **expiry/review date**
- **evidence_reference**: decision record / ticket / IAM approval artifact pointer (or `NOT AVAILABLE (MOCK/TEST)`)

### 4.4 Approval model linkage (required)

Approval expectations must link to the baseline access model:
- approvals must be **before** access provisioning (even in mock/test governance mode, the expectation is still recorded),
- self-approval is prohibited,
- worker/pay data access approvals require Privacy + relevant Data Owner roles, and Security involvement when high-risk privileges exist (per baseline).

---

## 5. Logging and audit-evidence expectations

### 5.1 Baseline linkage (required)

The evidence pack must explicitly link logging evidence to the baseline’s logging expectations:
- `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md` (Section 8 “Logging and audit expectations”)

### 5.2 What must be evidenced (governance expectation)

The evidence pack must include evidence references (or placeholders) showing how the program would prove that the following are logged:
- **Role membership changes** (grant/revoke; approver; timestamp; scope; expiry)
- **Access to worker/pay data classes** (view/query/export; actor; dataset class; timestamp; purpose/work item reference)
- **Edits to readiness-closure governance artifacts** (who/what/when/why where change control is available)
- **Break-glass events** (trigger, scope, duration, approver, after-action review outcome)

**Important:** R15 does not require real logs; it requires an evidence structure that makes the logging expectation explicit and reviewable.

### 5.3 Logging evidence representation (required)

Logging/audit evidence must be represented as:
- **logging_expectations_reference**: the baseline reference(s)
- **logging_evidence_reference**: pointer to where log exports/screenshots/audit queries would be stored for real pilot (or `NOT AVAILABLE (MOCK/TEST)`)
- **logging_fields_expected**: minimum fields expected (actor, timestamp, action, target, data class, outcome)
- **gaps**: explicit list of missing logging evidence items

---

## 6. Recertification expectations

### 6.1 Cadence linkage (required)

Recertification expectations must link to the baseline access model recertification cadence:
- privileged roles: at least monthly during readiness-closure,
- worker/pay data access roles: at least monthly and upon scope change,
- read-only roles: quarterly or milestone-based.

### 6.2 Recertification evidence representation (required)

Recertification evidence must be represented as:
- **recertification_schedule**: cadence + next due date
- **recertification_evidence_reference**: pointer to review record(s) (or `NOT AVAILABLE (MOCK/TEST)`)
- **recertification_outcomes_summary**: counts by outcome (e.g., renewed/revoked/pending) or `NOT AVAILABLE (MOCK/TEST)`
- **exceptions**: any cases where recertification could not be performed (with rationale and compensating controls)

---

## 7. Break-glass evidence expectations

### 7.1 Baseline linkage (required)

Break-glass expectations must link to:
- `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md` (Section 7 “Break-glass rules”)

### 7.2 Evidence representation (required)

Break-glass evidence must be represented as:
- **break_glass_policy_reference**: baseline reference(s)
- **break_glass_event_register_reference**: pointer to event register/log/ticket system (or `NOT AVAILABLE (MOCK/TEST)`)
- **event_fields_expected** (minimum): trigger/reason, scope, duration/expiry, approver, notifications, after-action review outcome, timestamps
- **oversight_expectations**: Internal Audit after-action review expectation and how it is evidenced

**Binding rule:** Break-glass entries must remain exceptional; repeated break-glass usage must be flagged as a control issue for real pilot readiness (as a governance note, not an implementation here).

---

## 8. Separation-of-duties evidence expectations

### 8.1 Minimum SoD checks (required)

The evidence pack must include a SoD evidence section showing:
- **self-approval prohibition** check outcome for each privileged access approval,
- **independence** of assurance (Internal Audit) from evidence creation for control-critical artifacts,
- **segregation** where applicable between requestors and approvers for worker/pay data access grants.

### 8.2 SoD exceptions (required)

If SoD cannot be achieved due to staffing constraints, the evidence pack must include:
- **exception statement** (what SoD rule is violated and why),
- **time-bound constraint** (expiry/review date),
- **compensating controls** (e.g., additional audit review of logs),
- **approval reference** for the exception (or `NOT AVAILABLE (MOCK/TEST)`).

---

## 9. Review and sign-off expectations

R15 defines the review structure; it does not execute approvals.

The evidence pack must include:
- **reviewer**: role + name (or `NOT AVAILABLE (MOCK/TEST)`)
- **review_date**: date (or `NOT AVAILABLE (MOCK/TEST)`)
- **sign_off_status**: `NOT_SUBMITTED | IN_REVIEW | APPROVED | REJECTED | NOT AVAILABLE (MOCK/TEST)`
- **sign_off_conditions**: explicit conditions required before any approval could be granted

**Binding rule:** Absence of sign-off is not implicit approval.

---

## 10. Completeness rules

Completeness is an objective checklist. Each evidence pack must declare:
- **completeness_status**: `COMPLETE (GOVERNANCE) | INCOMPLETE (MISSING REQUIRED SECTIONS) | NOT ASSESSED`
- **missing_sections**: explicit list of missing or placeholder-only sections
- **completeness_rationale**: short and specific

### 10.1 Minimum completeness checks (required)

1. Pack header present (id, version, created_at, mode)
2. Perimeter reference present with explicit MOCK/SYNTHETIC vs REAL interpretation
3. Access model baseline reference present
4. RBAC matrix reference present
5. Role assignment evidence section present (even if `NOT AVAILABLE (MOCK/TEST)`)
6. Approval evidence section present (even if `NOT AVAILABLE (MOCK/TEST)`)
7. Logging evidence section present with baseline linkage
8. Recertification evidence section present with cadence linkage
9. Break-glass evidence section present with baseline linkage
10. SoD evidence section present (including exception handling fields)
11. Reviewer + sign-off fields present
12. Missing sections are listed explicitly; no removal to “look complete”

---

## 11. Mock/test vs real pilot distinction

### 11.1 Mock/test governance mode (current posture)

In readiness-closure, the perimeter is **MOCK/SYNTHETIC only** and pilot entry is prohibited. Therefore:
- This evidence spec and any packs created under it are **structure + checklist** artifacts.
- Fields requiring real IAM records, real approvals, or real log exports must be set to `NOT AVAILABLE (MOCK/TEST)` with explicit gaps (no fabrication).
- These artifacts must not be used to assert Validation Charter Gate G4 is passed or that pilot access is approved.

### 11.2 Real pilot access evidence (future; not executed here)

Real pilot access evidence would require:
- a non-mock approved perimeter (Gate G1),
- executed access approvals (privacy/security/data-owner aligned),
- executed role provisioning (with verifiable membership records),
- verifiable logging/audit exports,
- executed recertification reviews with outcomes,
- and documented break-glass events (if any) with after-action review.

R15 does not perform these steps; it defines the structure that such steps must populate.

---

## 12. References to governing artifacts

Binding / governing references:
- Authoritative queue and status: `.claude/SLICE_QUEUE.md` (Wave R; R15; pilot blocked until R17)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Locked perimeter record (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Validation Charter v1 (authority model + Gate G4 expectations): `docs/validation/VALIDATION_CHARTER_v1.md`
- Access model baseline (R03): `docs/readiness-closure/13_access-model/ACCESS_MODEL_BASELINE.md`
- RBAC matrix v1 (R03): `docs/readiness-closure/13_access-model/RBAC_MATRIX_v1.md`

Related readiness bundles (for linkage only):
- Privacy approval bundle governance (R13): `docs/readiness-closure/11_privacy-bundle/PRIVACY_APPROVAL_BUNDLE_v1.md`
- Security approval bundle governance (R14): `docs/readiness-closure/12_security-bundle/SECURITY_APPROVAL_BUNDLE_v1.md`

