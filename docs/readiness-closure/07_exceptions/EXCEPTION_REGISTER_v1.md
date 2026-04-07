# EXCEPTION_REGISTER_v1 — Readiness-Closure (Wave R / R08)
**Artifact ID:** R08-EXCEPTION-REGISTER-v1  
**Status:** DRAFT (governance-only; mock/test readiness-closure mode)  
**Applies to:** Readiness-Closure evidence-closure only (Wave R).  
**Non-goals (binding):** This artifact does **not** execute exception handling, does **not** authorize pilot entry/execution, does **not** implement workflow/product code, and does **not** fabricate evidence or results.

---

## 1. Purpose and scope

This document defines the governance model for an **Exception Register** used in Readiness-Closure to ensure exceptions are:
- recorded in a **repeatable, reviewable** structure,
- **owned** (every exception has an accountable owner role),
- dispositioned via a consistent **state model**,
- classified by **severity** and **blocker flag** (distinct concepts),
- and **closed only with evidence** (not verbal assurance).

**In scope (R08):**
- exception register structure and required fields
- disposition workflow and statuses
- ownership and escalation rules
- severity + blocker handling
- closure evidence expectations
- linkage expectations to reconciliation, join integrity, mapping governance, confidence outputs, and decision records
- explicit mock/test vs real pilot distinction

**Out of scope (R08):**
- executing exception triage on real pilot runs
- producing populated exception registers for real data
- implementing any exception workflow tooling, code, UI, or automation
- authorizing pilot entry or pilot execution
- starting R09 confidence-output dry run artifacts

---

## 2. Exception-management principles

These principles are binding for readiness-closure exception governance:

- **No silent pass for critical risk**: no unresolved **CRITICAL** exception may be treated as implicitly accepted or “assumed okay”.
- **Fail-closed by default on pilot-mandatory truth**: exceptions affecting pilot-mandatory joins, remuneration truth, mapping completeness, or confidence hard-zero triggers are **blocker-capable** and must be explicitly dispositioned.
- **Every exception has an owner**: exceptions without an owner role are invalid entries and must be treated as governance defects.
- **Blockers must be explicit and reviewable**: a blocker is a control decision, not an implied severity. Blocker designation must be visible, justified, and reviewer-checkable.
- **Accepted exceptions still require evidence**: acceptance is not “no evidence needed”; acceptance requires rationale + risk statement + approvals + evidence references.
- **Closure is evidence-backed**: closure requires referenced artifacts proving resolution/verification; “fixed” without evidence is not closure.
- **Append-only discipline**: exceptions are never overwritten to “clean up”. Any change is recorded as a new status transition and/or new evidence reference.
- **Perimeter binding**: every exception entry must reference the locked perimeter (currently MOCK/SYNTHETIC) and the originating artifact(s).

---

## 3. Exception sources

Exceptions may originate from any governed readiness-closure artifact. At minimum, the register must support exceptions sourced from:

- **Join integrity proof** (R05)
  - `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_PROOF_v1.md`
  - populated join integrity reports created from `JOIN_INTEGRITY_REPORT_TEMPLATE_v1.md` (outside R08)
- **Mapping governance / earning code inventory** (R06)
  - `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_v1.md`
  - `docs/readiness-closure/05_mapping-governance/MAPPING_VERSION_LOCK_v1.md`
- **Payroll reconciliation dry-run** (R07)
  - `docs/readiness-closure/06_reconciliation/PAYROLL_RECONCILIATION_DRY_RUN_v1.md`
  - populated reconciliation reports created from `PAYROLL_RECONCILIATION_REPORT_TEMPLATE_v1.md` (outside R08)
- **Confidence model fail-closed design** (H05)
  - `docs/confidence/CONFIDENCE_MODEL_v1.md`
- **Methodology governance** (H03) where exception treatment impacts defensibility or overrides
  - `docs/methodology/METHODOLOGY_v1.md`
- **Reconciliation framework exception taxonomy** (H04)
  - `docs/reconciliation/exception-taxonomy_v1.json`

**Rule (binding):** the exception register is a *governance index*; it points to evidence artifacts rather than embedding sensitive data rows in-repo.

---

## 4. Required exception fields

Every exception entry MUST include all required fields defined in:
- `docs/readiness-closure/07_exceptions/EXCEPTION_REGISTER_TEMPLATE_v1.md`

Field meanings (governance semantics):
- **exception_id**: unique, stable ID; never reused.
- **perimeter reference**: the perimeter record applicable to this exception.
- **source artifact reference**: the specific report/artifact section that produced the exception.
- **exception code**: coded taxonomy identifier (preferred) or a controlled local code when taxonomy does not yet cover the case.
- **severity**: impact magnitude (CRITICAL/HIGH/MEDIUM/LOW).
- **blocker_flag**: whether this exception blocks downstream eligibility until dispositioned/closed.
- **current_status / disposition_status**: where it is in workflow and what decision has been made.
- **owner_role**: accountable role (not engineering-only by default).
- **resolution_required**: whether remediation is required vs risk acceptance is possible (must be explicit).
- **evidence_reference**: stable pointer(s) to proof of root cause and/or closure verification.
- **reviewer / sign-off_status**: who reviewed and whether approval exists (or is unavailable in mock/test).

---

## 5. Severity model

R08 defines the minimum severity model for consistency across readiness-closure evidence artifacts.

### 5.1 Severity levels (required)
- **CRITICAL**
  - Meaning: undermines pilot-mandatory truth, defensibility, or controlled access posture; cannot be ignored.
  - Typical examples: ambiguous identity join on mandatory key; unreconciled mandatory remuneration field; missing SoT/Methodology version reference for run.
- **HIGH**
  - Meaning: likely to materially affect outputs or evidence sufficiency; requires timely resolution or explicit acceptance with strong evidence and authority approval.
- **MEDIUM**
  - Meaning: affects quality or completeness; may be acceptable only with explicit risk acceptance and does not violate fail-closed triggers.
- **LOW**
  - Meaning: minor defect or documentation deficiency; still must be owned and tracked to closure.

### 5.2 Severity vs blocker (binding distinction)
- **Severity** expresses impact magnitude.
- **blocker_flag** expresses **control gating**.

**Rule (binding):**
- Any exception may be a blocker regardless of severity if it triggers a fail-closed gate (e.g., confidence hard-zero conditions, pilot-mandatory field missing).
- Any **CRITICAL** exception is presumed **blocker_flag = true** unless an explicit decision record (authority + no veto) documents a temporary deviation (rare; not executed in readiness-closure).

---

## 6. Ownership and escalation model

### 6.1 Ownership requirements (binding)
- Every exception must have exactly one **accountable owner_role** (RACI “A”), and may list consulted parties in `notes`.
- Owner role must reflect the domain of truth:
  - join/identity exceptions → **HRIS / People Data owner** (and/or data engineering owner where extraction/crosswalk mechanics are the cause)
  - remuneration truth / reconciliation exceptions → **Payroll controls owner**
  - earning-code mapping exceptions → **Payroll controls owner** (with Reward consulted if policy affects variable pay)
  - methodology/override governance exceptions → **Reward methodology owner** (Legal and Internal Audit consulted)
  - access/privacy/security-related exceptions → **Privacy lead** / **Security lead**

### 6.2 Escalation rules (binding)
Escalation is required when:
- **CRITICAL** severity is present, or
- **blocker_flag = true** and the exception remains non-closed beyond its target review window (if defined), or
- the exception requires cross-functional resolution across multiple owners.

Minimum escalation path (roles, not individuals):
- Owner role → **Internal Audit / Assurance lead** (evidence sufficiency check) → **VSG** (authority body per Validation Charter) for any acceptance or scope/tolerance deviations.

**Rule (binding):** engineering may draft the register mechanics but does not unilaterally disposition governance exceptions requiring business/control sign-off.

---

## 7. Disposition workflow

### 7.1 Required statuses (minimum set)
R08 uses the minimum disposition statuses already referenced in R07 governance:
- **OPEN**
- **UNDER_REVIEW**
- **EXPLAINED**
- **ACCEPTED_EXCEPTION**
- **REQUIRES_RERUN**
- **CLOSED**

Additionally, the register supports a distinct workflow state field:
- **current_status**: operational tracking status (e.g., OPEN/UNDER_REVIEW/CLOSED)
- **disposition_status**: the governance disposition outcome (e.g., ACCEPTED_EXCEPTION/REQUIRES_RERUN)

### 7.2 Status meaning (binding semantics)
- **OPEN**: exception identified and logged; owner assigned; evidence gathering not started or minimal.
- **UNDER_REVIEW**: owner actively investigating; root cause not yet evidenced.
- **EXPLAINED**: root cause is documented with evidence reference(s); resolution path and expected rerun requirements are stated.
- **ACCEPTED_EXCEPTION**: exception is accepted as residual risk with explicit rationale, scope impact statement, and required approvals recorded (decision record reference required; do not fabricate in mock/test).
- **REQUIRES_RERUN**: remediation or governance changes require rerun/re-evaluation (new extracts, new mapping version, new join keys/crosswalk, recalculation, etc.).
- **CLOSED**: resolved and verified; closure evidence exists, and reviewer sign-off status is complete (or explicitly marked as mock/test placeholder).

### 7.3 Allowed transitions (minimum)
Allowed baseline transitions:
- OPEN → UNDER_REVIEW
- UNDER_REVIEW → EXPLAINED
- EXPLAINED → REQUIRES_RERUN
- EXPLAINED → ACCEPTED_EXCEPTION
- REQUIRES_RERUN → UNDER_REVIEW (new run/re-evaluation)
- ACCEPTED_EXCEPTION → CLOSED (once approval + evidence references are complete)
- REQUIRES_RERUN → CLOSED (only after rerun evidence verifies resolution)

**Rule (binding):** CLOSED requires evidence; it is not a “status convenience”.

---

## 8. Closure evidence requirements

Closure is valid only when it is evidence-backed and reviewable.

### 8.1 Evidence principles (binding)
- Evidence references must be **stable pointers** (artifact path, report id, digest, access-controlled location pointer).
- Do not embed sensitive worker-level rows in this repo.
- Evidence must be sufficient for **later readiness review** (R17) to validate closure without oral context.

### 8.2 Minimum closure evidence by exception class (guidance)
At minimum, closure evidence SHOULD include:
- **Join integrity exceptions**: updated join integrity report reference + drill-down exception pointer(s) + uniqueness/cardinality checks resolved.
- **Mapping exceptions**: earning-code inventory entry references + mapping version lock reference + approval placeholders/records + reconciliation rerun evidence.
- **Reconciliation variances**: reconciliation report(s) before/after + tolerance statement + linked taxonomy codes + rerun evidence.
- **Confidence gate failures**: confidence gate evaluation output reference (R09 will define structure; not created here) + mapped fail-closed triggers and reason codes + rerun/accept decision reference.

### 8.3 Closure sign-off expectations (binding)
- Closed exceptions must identify a **reviewer** role appropriate to the domain (Payroll controls, HRIS owner, Legal, Internal Audit).
- If a closure is an **accepted exception**, closure must reference:
  - a decision record entry under the Validation Charter authority model (VSG quorum + no veto), and
  - an explicit residual risk statement and mitigations.

---

## 9. Relationship to blocker/warning decisions

Blocker/warning is a control decision that must be visible and consistent with governing artifacts.

### 9.1 Rules (binding)
- If an exception matches a taxonomy entry with `severity_default = BLOCKER` and `blocker_eligible = true`, then **blocker_flag defaults to true** unless an explicit authority decision records an exception (do not fabricate).
- If an exception affects any **pilot-mandatory field** or any **confidence hard-zero trigger**, it is **blocker-capable** and defaults to **blocker_flag = true**.
- Warnings may proceed only with explicit risk acceptance and must still be recorded, owned, evidenced, and reviewed.

### 9.2 “No unresolved critical silently pass” (binding)
Any exception that is either:
- **severity = CRITICAL**, or
- **blocker_flag = true**
must be explicitly dispositioned (ACCEPTED_EXCEPTION or REQUIRES_RERUN) and cannot remain indefinitely in OPEN/UNDER_REVIEW at readiness review time.

---

## 10. Relationship to confidence and rerun decisions

The exception register must support rerun decisions and confidence gating alignment.

### 10.1 Rerun decision support (binding)
The register must capture whether an exception **requires rerun** and what changed:
- extracts/crosswalk version change
- mapping version change
- perimeter/scope policy change
- reconciliation method/tolerance change
- methodology or override state change

**Rule:** if resolution changes any referenced versioned control artifact, the exception must be marked **REQUIRES_RERUN** until new evidence confirms the outcome.

### 10.2 Confidence alignment (binding)
Where exceptions correspond to confidence fail-closed triggers (H05 Section 8), the register must:
- link to the related confidence reason codes / trigger identifiers (by reference), and
- ensure blocker exceptions do not allow downstream “valid” outputs without recorded disposition and rerun evidence.

**Note:** R09 will define the confidence output/gate-evaluation evidence structure. R08 requires linkability but does not create R09 artifacts.

---

## 11. Mock/test vs real pilot distinction

### 11.1 Mock/test readiness-closure mode (current)
R08 is complete in mock/test governance mode when:
- the register governance model and template exist,
- required statuses/severity/blocker/ownership/evidence expectations are explicit,
- references align to existing governing artifacts, and
- artifacts clearly state **governance-only** and **MOCK/SYNTHETIC perimeter** posture.

Mock/test mode must not:
- include real employee payroll data,
- fabricate exception counts, outcomes, or approvals,
- imply pilot readiness, pilot entry, or operational exception handling.

### 11.2 Real pilot mode (future; not executed here)
Real pilot operation of the exception register would require:
- real perimeter approval (Gate G1) + privacy/security clearance (Gate G4),
- populated join/reconciliation/confidence outputs created from real runs,
- real decision record entries for accepted exceptions,
- and explicit reviewer sign-offs with evidence references.

---

## 12. References to governing artifacts

Binding / governing references:
- Authoritative queue and status: `.claude/SLICE_QUEUE.md` (Wave R; R08)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Locked perimeter record (MOCK/SYNTHETIC interpretation): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md`
- Validation Charter v1 (authority/veto model; fail-closed posture): `docs/validation/VALIDATION_CHARTER_v1.md`
- Reconciliation framework + exception taxonomy v1:
  - `docs/reconciliation/RECONCILIATION_FRAMEWORK_v1.md`
  - `docs/reconciliation/exception-taxonomy_v1.json`
- Join integrity governance:
  - `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_PROOF_v1.md`
  - `docs/readiness-closure/04_join-integrity/JOIN_INTEGRITY_REPORT_TEMPLATE_v1.md`
- Mapping governance:
  - `docs/readiness-closure/05_mapping-governance/EARNING_CODE_INVENTORY_v1.md`
  - `docs/readiness-closure/05_mapping-governance/MAPPING_VERSION_LOCK_v1.md`
- Reconciliation dry-run governance:
  - `docs/readiness-closure/06_reconciliation/PAYROLL_RECONCILIATION_DRY_RUN_v1.md`
  - `docs/readiness-closure/06_reconciliation/PAYROLL_RECONCILIATION_REPORT_TEMPLATE_v1.md`
- Confidence model v1 (fail-closed triggers): `docs/confidence/CONFIDENCE_MODEL_v1.md`

