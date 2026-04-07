# ACCESS_MODEL_BASELINE — Readiness-Closure (Wave R / R03)
**Artifact ID:** R03-ACCESS-MODEL-BASELINE  
**Status:** DRAFT (governance baseline for mock/test readiness-closure work)  
**Applies to:** Readiness-Closure artifacts and controlled evidence-closure activities only (Wave R: R03 and informs R15)  
**Non-goals (binding):** This baseline does **not** implement IAM, does **not** claim security sign-off, and does **not** authorize pilot entry or pilot execution.

---

## 1. Purpose and scope
This document defines the **baseline access-model governance** for the Readiness-Closure phase so controlled, mock/test evidence-closure work can be performed safely and repeatably.

It establishes:
- the **role model** used for readiness-closure artifacts and mock/test datasets,
- the **approval path** required before access is granted,
- least-privilege and separation-of-duties expectations,
- break-glass rules (exceptional, time-bound, and auditable),
- logging/audit expectations and recertification cadence.

**Scope boundaries**
- **In scope:** governance controls for access to readiness-closure artifacts, mock/synthetic datasets, and any worker/pay-related content used for validation/testing in mock mode.
- **Out of scope:** production IAM integration, enforcement implementation, or any real pilot approval/execution activities.

---

## 2. Mock/test governance status
**Binding interpretation for this phase:**
- **Pilot entry remains prohibited** until R17 passes and a subsequent GO decision is recorded.
- The current perimeter is **MOCK / SYNTHETIC only** for governance continuity.
- Readiness-closure continues in **mock/test governance mode**.

This access model is therefore a **baseline governance structure** for controlled readiness-closure work. It is **not equivalent** to “pilot security approval” and must not be presented as such.

---

## 3. Access design principles
These principles are mandatory for readiness-closure access decisions.

- **No ad-hoc access**: all access must be via named roles and documented approvals.
- **Least privilege by default**: default is no access; grants are minimal and time-bounded where practical.
- **Approval before access**: no role membership is granted before approvals are recorded.
- **Worker/pay data access is always logged**: any access to worker-level or pay-level data (even mock) must be auditable.
- **Need-to-know**: access is limited to the minimum artifact/data class required to perform an approved readiness-closure task.
- **Fail-closed**: if a request is ambiguous (scope, dataset, purpose), access is denied until clarified.
- **Separation of duties (SoD)**: where control roles exist, they must not self-approve or self-audit.

---

## 4. Role model
Roles are defined for readiness-closure governance. Roles are **functional** and can be mapped to groups in whatever IAM exists later, but **this slice does not implement IAM**.

**Baseline roles (minimum)**
- Program Director
- Payroll Controls Lead
- HRIS / People Data Owner
- Reward / Job Architecture Lead
- Privacy Lead
- Security Architect
- Internal Audit / Assurance
- QA / Validation Lead
- Engineering / Implementation
- Read-only Reviewer

**Role-to-permission mapping** is defined in `RBAC_MATRIX_v1.md` and is the authoritative source for what a role may do.

**Role membership discipline**
- Membership is **named and recorded** (role → person; start date; end date if time-bound).
- A person may hold multiple roles **only if SoD is preserved** (see Section 10).

---

## 5. Approval model
All access grants must be approved **before** provisioning (even in mock/test mode).

### 5.1 Access request requirements
Every access request must state:
- requestor (role + name)
- requested role(s)
- purpose (mapped to a readiness-closure work item, e.g., R03, R05, R07)
- requested scope (artifact set + dataset class)
- duration (start/end or review date)
- SoD check (who will approve; who will review)

### 5.2 Approval path (baseline)
Approvals are role-based (not individuals). Minimum approval expectations:
- **Read-only access to governance docs (no worker/pay data):**
  - Approver: Program Director (or delegate)  
  - Logging: document access logging if available; otherwise change-control logging for edits (see Section 8)
- **Access to worker/pay data (including mock/synthetic worker/pay):**
  - Approvers: Privacy Lead **and** relevant Data Owner (HRIS and/or Payroll Controls Lead, depending on dataset)
  - Security Architect is required where access enables bulk export, copying, or broad visibility
- **Privileges that change controls or evidence artifacts (edit/approve/attest):**
  - Approvers: Program Director **and** Internal Audit / Assurance acknowledgement (for control-impacting roles)

### 5.3 Self-approval prohibition
- No requester may approve their own access.
- No approver may approve access that would cause an SoD violation without a documented exception and compensating controls.

---

## 6. Least-privilege rules
The following rules apply to all readiness-closure access grants:

- **Default is read-only** unless edit is explicitly required.
- **Worker/pay data access is minimized**:
  - prefer aggregated, masked, or synthetic subsets when acceptable for the task,
  - prohibit “full dataset” grants unless explicitly justified and approved.
- **Time-bounded grants**:
  - privileged access should have an expiry (e.g., 7–30 days) with recertification required to extend.
- **Tooling constraints (governance, not implementation)**:
  - avoid distributing raw exports; prefer controlled evidence artifacts with references and digests where feasible.

---

## 7. Break-glass rules
Break-glass access exists only to unblock a controlled readiness-closure activity when normal approval is unavailable and delay would create material program risk.

**Break-glass conditions (must all be true)**
- the access need is urgent and time-critical,
- the scope is minimal and time-bound,
- the event is logged with a reason code and after-the-fact review is mandatory,
- the access does not authorize pilot execution or processing of real employee data.

**Break-glass approvals (minimum)**
- Approver: Program Director (or delegated on-call control authority)  
- Required notification: Privacy Lead and Security Architect  
- Required after-action review: Internal Audit / Assurance

**Break-glass expiry**
- Access must expire automatically at the shortest feasible duration (target: < 24 hours).

---

## 8. Logging and audit expectations
This baseline defines logging expectations; it does not implement logging systems.

### 8.1 What must be logged (minimum)
- **Role membership changes** (grant/revoke; approver; timestamp; scope; expiry)
- **Access to worker/pay data** (view/query/export; actor; dataset class; timestamp; purpose/work item reference)
- **Edits to readiness-closure governance artifacts** (who changed what; when; change reason)
- **Break-glass events** (trigger, scope, duration, approver, after-action review outcome)

### 8.2 Log retention (baseline expectation)
- Retain access logs and approval records for the duration of readiness-closure and through the second readiness review (R17), plus any additional retention required by internal policy. If policy is unknown, default to retaining until the program formally closes the readiness decision pack.

### 8.3 Auditability requirement
- Logs must be exportable for Internal Audit review and must support traceability from a person → role → action → artifact/data class.

---

## 9. Review and recertification expectations
Access must be reviewed on a fixed cadence:
- **Privileged roles** (edit/approve/export): recertify at least **monthly** during readiness-closure.
- **Worker/pay data access roles**: recertify at least **monthly**, and immediately upon any scope change or veto invocation that affects data handling.
- **Read-only roles**: recertify at least **quarterly** (or at phase transition milestones, whichever is sooner).

Recertification must confirm:
- continued need
- scope remains minimal
- no SoD violations introduced
- logging is functioning for the relevant access surfaces (or exceptions are documented)

---

## 10. Separation-of-duties expectations
SoD is required to ensure approvals and assurance are independent.

**Baseline SoD rules (minimum)**
- The **requestor** cannot be the **approver**.
- **Engineering / Implementation** may not approve their own privileged access to worker/pay data.
- **Internal Audit / Assurance** must not hold roles that create or materially modify the evidence artifacts they later assure, except for read-only review of those artifacts.
- **Security Architect** and **Privacy Lead** should not be the sole approver for access that primarily benefits their own work stream; at least one relevant Data Owner or Program Director approval is required depending on scope.

Where SoD cannot be achieved due to staffing constraints, access must:
- be time-bounded,
- have compensating review (e.g., Internal Audit review of logs),
- be documented as an exception with rationale.

---

## 11. What this baseline authorizes
This baseline authorizes **readiness-closure governance work** in mock/test mode, including:
- defining and assigning readiness-closure roles for controlled work,
- approving access requests for readiness-closure artifacts and mock/synthetic datasets,
- establishing and applying logging/audit expectations for controlled access,
- performing reviews/recertifications within readiness-closure governance.

---

## 12. What this baseline does not authorize
This baseline does **not** authorize:
- pilot entry or pilot execution (still prohibited until R17 passes and a GO decision is recorded),
- processing, extraction, or use of real employee data in the absence of the required privacy/security approvals and bundles,
- any security sign-off claims (no “approved by security” statements),
- implementation of IAM/RBAC enforcement in product systems,
- any product feature work or downstream slice execution outside Wave R governance scope.

---

## 13. References to governing artifacts
- Authoritative queue and phase constraints: `.claude/SLICE_QUEUE.md` (Wave R; pilot blocked until R17)
- Readiness-Closure phase definition: `docs/readiness-closure/README.md`
- Validation authority model + veto rights: `docs/validation/VALIDATION_CHARTER_v1.md`
- Pilot scope lock (mock/synthetic perimeter; not real approval): `docs/readiness-closure/02_scope-lock/PILOT_SCOPE_LOCK_RECORD.md` and `docs/readiness-closure/01_decision-log/DR-0003_PILOT_SCOPE_LOCK.md`
- Decision log discipline (append-only): `docs/readiness-closure/01_decision-log/DECISION_LOG.md`
- RBAC role matrix for this baseline: `docs/readiness-closure/13_access-model/RBAC_MATRIX_v1.md`

