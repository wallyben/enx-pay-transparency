# Validation Charter v1 — Enterprise Hardening Phase (Wave H)

**Document ID:** VALIDATION_CHARTER_v1  
**Status:** DRAFT (binding governance once signed)  
**Effective date:** TBD (upon sign-off)  
**Applies to:** Wave H (Enterprise hardening / validation-first) and the constrained enterprise pilot  
**Precedence:** This charter governs pilot decisions. It is compatible with, and operationalizes, the enterprise hardening redirect in `docs/validation/REDIRECT_DECISION.md`.

---

## 1. Purpose

This charter is the formal governance contract for the enterprise-hardening validation phase. It defines:

- **What must be proven** before any pilot execution, and before any downstream product hardening or feature work resumes.
- **How validation is measured** via objective pass/fail gates and required evidence artifacts.
- **Who can stop the pilot** (veto rights) and **who decides go/no-go** (authority model, quorum, decision log).

**Binding rule:** No pilot execution and no resumption of paused/deferred downstream slices occurs until the gates in this charter are satisfied and recorded in the decision log.

**Anti-false-progress rule (binding):** Creating or expanding product features, dashboards, reporting surfaces, schemas/contracts, or downstream implementation work is **not authorized** by progress on gate documentation alone. Authorization requires an explicit **GO** decision recorded under Section 12 (and no active veto).

---

## 2. Scope

### 2.1 In scope (this charter governs)

- A **constrained enterprise pilot** validating truth, defensibility, and governance.
- **Field-level source-of-truth definition** (by reference to H02 deliverable) for pilot-mandatory fields.
- **Methodology v1** (by reference to H03 deliverable) for comparable categories / equal-value defensibility and governance.
- **Reconciliation framework** (by reference to H04 deliverable) anchored to payroll truth.
- **Confidence model** (by reference to H05 deliverable) and fail-closed gating rules.
- **Evidence artifacts** required to support each gate and to support external audit review.
- The **authority model** (go/no-go), **veto rights**, and **decision logging** required for the pilot and for resumption decisions.

### 2.2 Explicitly out of scope (not governed or implemented here)

- Any product/application code changes, new features, dashboards, or reporting expansion.
- Any schema/contract implementation or field matrix implementation (H02 is referenced, not implemented).
- Any methodology implementation content beyond what is required to define sign-off path and required evidence.
- Any reconciliation engine design beyond defining reconciliation obligations, evidence outputs, and gate criteria.
- Pilot execution tasks (data extraction, runs, remediation, operational playbooks) beyond defining required scope and evidence.

---

## 3. In-scope systems

The pilot is **multi-source by design**. Validation must prove cross-system truth and join integrity.

### 3.1 Systems to be included in pilot scope (minimum)

- **HRIS / workforce system** (e.g., Workday): worker identity and job-related attributes.
- **Payroll system**: remuneration truth anchor (pay components, payroll calendar, off-cycle, retro).
- **Reward / compensation system(s)** (if separate from HRIS): salary bands, variable pay eligibility, job architecture inputs where relevant.
- **Identity and access management** (for pilot access control approvals and auditability): e.g., Azure AD / SSO.

### 3.2 System-of-record principle (binding)

- **Payroll is the anchor truth for remuneration** unless explicitly justified and documented in the Source-of-Truth (SoT) Matrix v1 (H02) for a specific field.
- Any field used in calculations or categorizations must have an explicit **system-of-record** and **reconciliation method**.

---

## 4. In-scope entities and identifiers

### 4.1 Entities (minimum)

- **Worker**
- **Job / position** (as represented in HRIS and/or job architecture)
- **Employment / assignment** (where distinct from worker)
- **Pay record / earning line**
- **Pay period**
- **Comparable category assignment** (including equal-value grouping where applicable)

### 4.2 Identifier requirements (binding)

For every in-scope entity, pilot data must include:

- **Primary identifier** in the source system (immutable key when available)
- **Cross-system linkage key(s)** used to join records
- **Effective dating** / validity window (as applicable)
- **Uniqueness constraints** (documented; duplicates are exceptions requiring resolution)

### 4.3 Join integrity measurement (binding)

Join integrity must be measured and evidenced at each required join boundary, including at minimum:

- HRIS worker ↔ payroll worker
- HRIS job/position ↔ reward/job-architecture reference (if applicable)
- Payroll earning lines ↔ remuneration components used in pay transparency calculations

Join integrity is a gate input (see Section 9).

---

## 5. Mandatory pilot fields

The pilot must define a **pilot-mandatory field set**. This charter defines the structure and the rule, not the full field list.

### 5.1 Pilot-mandatory field set structure (required)

The pilot-mandatory field set must be documented in **SoT Matrix v1 (H02)** and must include, per field:

- Field name and semantic definition (business definition, not UI label)
- System-of-record and extraction method
- Derivation / precedence rules (if computed)
- Data owner (business function owner, not engineering)
- Privacy classification (PII / special category / sensitive)
- Reconciliation method and tolerance
- Failure severity: **BLOCKER** (fail-closed) vs **WARNING** (allowed with explicit recorded risk)

### 5.2 Minimum categories of mandatory fields (binding)

At minimum, the pilot-mandatory field set must cover:

- **Worker identity & eligibility**: stable worker ID, employment status, contract type, employment type, start/end dates.
- **Demographics required for statutory calculations**: gender (and any locally required attributes, handled via overlay in later waves; pilot uses the minimum required for EU core).
- **Work fraction and comparability drivers**: FTE fraction, working time basis, location (as used in the methodology), job title and job architecture references.
- **Remuneration components**: base pay, variable pay/bonus, allowances/benefits where required by methodology and reconciliation plan.
- **Period context**: pay period boundaries, payroll calendar, off-cycle handling flags.

### 5.3 Mandatory-field completeness rule (binding)

If any **pilot-mandatory** field is missing, unmapped, or fails structural validation for any in-scope record set, the pilot run is **BLOCKED** unless an explicit exception is approved under the veto/authority model and recorded in the decision log.

---

## 6. Mandatory reconciliations

Validation must be anchored to **payroll truth** and must demonstrate that the system’s outputs are reproducible and explainable.

### 6.1 Reconciliation obligations (required)

The reconciliation framework (H04) must specify, and the pilot must execute, reconciliations at minimum for:

- **Join integrity** across sources (identity and cardinality checks)
- **Remuneration totals**: payroll totals vs pilot computation inputs/outputs at worker-level and aggregate levels
- **Component completeness**: mapping of earning codes/components to the model, with explicit handling for unmapped codes
- **Inclusion/exclusion reasons**: each excluded worker/earning line must have a coded reason and an owner-reviewed acceptability

### 6.2 Tolerance discipline (binding)

All reconciliations must define:

- Numerical tolerances (absolute and/or percentage) and how they are applied
- Materiality thresholds and which failures are blockers
- Exception taxonomy mapping (H04) with escalation paths

### 6.3 Re-run and immutability discipline (binding)

Each pilot run must be reproducible from:

- The same source extracts (or immutable snapshots thereof)
- The same SoT Matrix version, methodology version, and reconciliation framework version
- A recorded run identifier and evidence bundle

---

## 7. Methodology sign-off path

The methodology is treated as a governed compliance artifact.

### 7.1 Required methodology artifacts (by reference)

Methodology v1 (H03) must define:

- Factor model and definitions (skills/effort/responsibility/working conditions or equivalent agreed model)
- Scoring/weighting and calibration process
- Challenge/appeal process and expiry/refresh cadence
- Override governance: who can propose, who can approve, expiry rules, and audit evidence
- Versioning and change control rules

### 7.2 Sign-off sequence (binding)

Methodology sign-off must follow this minimum sequence, with recorded approvals:

1. **Reward owner approval** (business owner of job architecture / pay methodology)
2. **Legal sign-off** (defensibility and regulatory adequacy)
3. **Internal Audit / Assurance acknowledgement** (evidence sufficiency and control design adequacy)

If any step is not complete, the pilot cannot proceed to a go/no-go decision except to record a formal **NO-GO**.

---

## 8. Privacy and security approvals

Pilot validation involves worker-level pay and identity data and therefore requires explicit approvals and controls.

### 8.0 Definitions (binding)

For the purposes of gates G4 and G10:

- A **critical privacy/security issue** is any finding that indicates unlawful processing risk or uncontrolled exposure risk, including at minimum:
  - missing required privacy approval (Section 8.1) or required legal basis / DPIA outcome where applicable
  - inability to demonstrate purpose limitation, minimization, or retention discipline for pilot extracts
  - access control gaps that allow unauthorized access to worker-level pay/identity data
  - missing or non-functional audit/logging for pilot data access or pilot runs
  - any confirmed or suspected access to pilot data outside approved groups/roles
  - any unresolved “Critical/High” security finding (per the organization’s security rating scheme) that applies to pilot data handling

### 8.1 Required approvals (binding)

Before pilot execution (use of real or pseudonymized employee data), the following must approve:

- **Privacy / GDPR lead**: lawful basis, purpose limitation, minimization, retention, DPIA/assessment status as required
- **Security architect / security lead**: access control model, logging, encryption posture, secrets handling, environment controls
- **Data owner approvals** for each source system: HRIS, payroll, reward

### 8.2 Minimum control evidence (required)

Evidence artifacts must include:

- Access list (named roles/groups) and approval record
- Logging/audit evidence plan for data access and pilot runs
- Data handling rules: retention, deletion schedule for pilot extracts, storage location classification
- Any required DPIA / risk assessment references and outcomes (or formal statement why not required)

If privacy/security approval is missing or conditions are not met, the pilot is a **hard stop** (veto applies).

---

## 9. Pass/fail gates

Gates are objective. A gate is **PASSED** only when its required evidence exists and meets the criteria. Otherwise it is **FAILED** (or **BLOCKED** if prerequisites are missing).

### 9.1 Gate list (minimum)

**G0 — Charter adoption**
- **Pass criteria**: This charter is signed by the required approvers (Section 11 authority model and Section 8 approvals list) and a decision log entry records adoption.
- **Evidence**: Signed charter; decision log entry.

**G1 — Pilot scope locked**
- **Pass criteria**: Pilot scope document exists with systems, entities, identifiers, population inclusion rules, and explicit exclusions; scope is approved by the go/no-go authority body.
- **Evidence**: Pilot scope record (Section 2/3/4 structure) + sign-off; decision log entry.

**G2 — SoT Matrix v1 complete (pilot-mandatory fields)**
- **Pass criteria**: SoT Matrix v1 exists (H02) covering all pilot-mandatory fields with SoR, owners, reconciliation method, tolerances, and blocker/warning classification.
- **Evidence**: SoT Matrix v1 artifact + approval record(s).
- **Notes**: Missing SoT entries for any pilot-mandatory field is a **BLOCKER**.

**G3 — Methodology v1 signed off**
- **Pass criteria**: Methodology v1 (H03) is approved per Section 7 sequence; override governance is defined; required evidence for defensibility is documented.
- **Evidence**: Methodology v1 artifact + approvals (Reward, Legal, Audit acknowledgement).

**G4 — Privacy & security clearance**
- **Pass criteria**: All Section 8 approvals obtained; access and retention controls documented; no open critical privacy/security findings.
- **Evidence**: Approval records; control evidence bundle.

**G5 — Reconciliation framework ready**
- **Pass criteria**: Reconciliation framework (H04) exists with exception taxonomy, tolerances, and required reports; owners for each reconciliation are named.
- **Evidence**: H04 artifact + owner sign-off; sample output templates (even if empty).

**G6 — Confidence model defined and fail-closed policy approved**
- **Pass criteria**: Confidence model (H05) exists with thresholds and propagation rules; explicit fail-closed triggers are defined for pilot-mandatory failures and reconciliation blockers.
- **Evidence**: H05 artifact + approvals (go/no-go body; privacy/security review if confidence uses sensitive signals).

**G7 — Data readiness (extracts + join integrity)**
- **Pass criteria**:
  - Pilot extracts exist for in-scope systems and match the locked scope.
  - Join integrity across sources meets minimum threshold: **>= 99%** for required joins (or higher threshold if set in H04/H02).
  - Duplicates and orphan records are below defined tolerance and are fully exception-coded.
- **Evidence**: Join integrity report; exception register; extract metadata; run log entry.

**G8 — Reconciliation pass (payroll-anchored)**
- **Pass criteria**:
  - Payroll vs computed remuneration totals within agreed tolerances at required levels (worker-level and aggregates as defined in H04).
  - All exceptions are coded, owned, and dispositioned (accepted risk or corrected), with no unresolved blockers.
- **Evidence**: Reconciliation report(s); exception disposition approvals; decision log entry for any accepted risk.

**G9 — Explainability and reproducibility**
- **Pass criteria**: For any sampled worker and any aggregate output required for the pilot, evidence exists to trace:
  - source extracts → identifiers → derivations → SoT Matrix version → methodology version → decision/override records → output.
- **Evidence**: Explainability walkthrough pack; reproducibility statement; audit trail references.

**G10 — Pilot pass (hard gate for resumption)**
- **Pass criteria**: All of G0–G9 passed; zero critical audit/privacy issues; go/no-go authority records **GO** for pilot completion and eligibility to resume downstream work.
- **Evidence**: Gate checklist; final decision log entry; compiled evidence bundle index.

### 9.2 Gate outcomes (required)

Each gate must be recorded as one of:

- **PASSED**
- **FAILED**
- **BLOCKED** (missing prerequisite artifact or approval)

Each non-passed gate must include:

- Owner
- Blocking issue(s) / exception codes
- Required remediation actions (by owner function)
- Target re-evaluation date

### 9.3 GO decision validity (binding)

Any recorded **GO** decision is invalid unless:

- all prerequisite gates for that decision point are **PASSED** (no FAILED/BLOCKED gates), and
- there is **no active veto** (Section 10), and
- the decision entry is recorded in Section 12 with required sign-offs.

---

## 10. Veto rights

Veto rights are **hard stops**. A veto prevents a GO decision, pilot execution, or resumption of downstream slices until resolved and formally lifted in the decision log by the veto holder.

### 10.1 Veto holders (minimum; named roles, not individuals)

- **Privacy / GDPR lead**: veto on purpose limitation, minimization, retention, unlawful processing, insufficient DPIA outcomes.
- **Security architect / security lead**: veto on unacceptable access control, logging, encryption posture, secrets handling, environment controls.
- **Internal Audit / Assurance lead**: veto on missing evidence, non-reproducibility, control bypass, or inadequate audit trail.
- **Legal counsel (employment/regulatory)**: veto on methodology defensibility, insufficient challenge/override governance, or legal-sign-off evidence gaps.
- **Payroll controls lead**: veto on unreconciled remuneration truth, unacceptable payroll reconciliation gaps, or uncontrolled earning-code mappings.

### 10.2 Veto invocation (required)

To invoke a veto, the holder must create a decision log entry that includes:

- Veto reason and impacted gate(s)
- Evidence supporting the veto
- Minimum conditions to lift the veto
- Interim risk statement (if pilot materials exist)

### 10.3 Veto lift (binding)

- A veto may only be lifted by the **same veto holder role** that invoked it (or their formally delegated acting holder).
- Lifting a veto requires a new decision log entry (Section 12) that references the original veto entry and links the evidence demonstrating the veto’s lift conditions are met.
- A veto may not be overridden by majority vote.

---

## 11. Go/no-go authority

### 11.1 Decision body (required)

Go/no-go decisions are made by a **Validation Steering Group (VSG)** composed of business owners and control functions. Engineering provides evidence but does not own the decision.

**Required representation (minimum):**

- Reward methodology owner (chair or co-chair)
- Payroll controls owner
- HRIS / People Data owner
- Legal representative
- Privacy / GDPR lead
- Security lead
- Internal Audit / Assurance lead

### 11.2 Quorum and voting (binding)

- **Quorum**: at least one representative from each of the following must be present: Reward, Payroll, Legal, Privacy, Security, Internal Audit.
- **Decision rule**: GO requires quorum + majority approval **and** no active veto.
- **NO-GO** may be recorded by majority or by any active veto.

### 11.3 Authority boundaries (binding)

- The VSG has authority to declare **GO/NO-GO** for:
  - pilot execution readiness
  - pilot pass
  - eligibility to resume paused/deferred downstream slices
- Engineering may not override or bypass VSG decisions.

---

## 12. Decision log template

All validation decisions (scope, gate outcomes, exceptions, go/no-go, veto invocation/lift) must be recorded using the following template.

### Decision log entry template (copy/paste)

**Decision ID:** VLD-YYYYMMDD-###  
**Date/time (ISO):**  
**Decision type:** [Scope | Gate outcome | Exception disposition | Veto | Go/No-Go | Artifact adoption | Other]  
**Related gate(s):** [G0–G10]  
**Status:** [PROPOSED | APPROVED | REJECTED | SUPERSEDED]  

**Context**
- What prompted the decision?
- Which systems/entities/fields are affected?

**Decision**
- Clear statement of what is approved/rejected.

**Rationale**
- Why this decision is correct given validation objectives and constraints.

**Evidence references**
- List artifacts with stable identifiers/versions (SoT Matrix v1, Methodology v1, reconciliation outputs, approval records).

**Risk and mitigations**
- Residual risk (if any) and how it is mitigated.

**Approvals**
- VSG attendees (role + name)
- Approver roles signing the decision (role + name)
- Any abstentions and why

**Veto check**
- Active veto present? [Yes/No]
- If yes: veto holder + link to veto entry

**Actions**
- Action items (owner role, due date, deliverable)

**Supersedes / links**
- Prior decisions superseded, if any

### 12.2 Decision log register (append-only, binding)

Decision log entries are maintained **in this charter** to prevent drift and to keep the authoritative record versioned with the governance contract.

Append new entries under the table below (do not edit prior entries; supersede them via a new entry).

| Decision ID | Date/time (ISO) | Type | Gate(s) | Status | Summary | Approver roles |
|---|---|---|---|---|---|---|
| VLD-YYYYMMDD-### |  |  |  |  |  |  |

---

## 13. Required evidence artifacts

This charter requires the following evidence artifacts to exist for validation to proceed. Artifacts may be documents, structured tables, or generated reports, but must be versioned and referenced in the decision log.

### 13.1 Core artifacts (must exist)

- **Validation Charter v1** (this document), signed (G0)
- **Pilot scope record** (G1): systems/entities/identifiers/population/exclusions
- **SoT Matrix v1** (H02) (G2)
- **Methodology v1** (H03) (G3)
- **Reconciliation framework + exception taxonomy** (H04) (G5)
- **Confidence model + fail-closed gates** (H05) (G6)
- **Privacy & security approvals bundle** (G4)

### 13.2 Execution evidence (must be produced during pilot)

- Join integrity reports (G7)
- Reconciliation reports (G8)
- Exception register with disposition approvals (G7/G8)
- Explainability walkthrough pack and reproducibility statement (G9)
- Final gate checklist with outcomes (G10)
- Decision log entries for: charter adoption, scope lock, all gate outcomes, exceptions accepted, vetoes, and go/no-go outcomes

---

## 14. Appendices / referenced artifacts

### 14.1 Binding references (must read)

- `docs/validation/REDIRECT_DECISION.md` — Enterprise hardening redirect (binding)
- `.claude/PROJECT_PLAN.md` — governing principles and non-bypassable gates
- `.claude/SLICE_QUEUE.md` — authoritative slice order and status

### 14.2 Future supporting artifacts (referenced; not implemented in H01)

- **SoT Matrix v1** (H02): field-level source-of-truth ownership, reconciliation, tolerances, severity
- **Methodology v1** (H03): defensible equal-value methodology package and governance
- **Reconciliation framework** (H04): payroll-anchored reconciliation model and exception taxonomy
- **Confidence model** (H05): confidence thresholds and fail-closed propagation rules

