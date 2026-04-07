# RBAC_MATRIX_v1 — Readiness-Closure (Wave R / R03)
**Artifact ID:** R03-RBAC-MATRIX-v1  
**Status:** DRAFT (mock/test readiness-closure governance baseline)  
**Scope note (binding):** This matrix is for readiness-closure mock/test governance only. It is not equivalent to real pilot security approval and does not authorize pilot execution.

This matrix defines role intent and permission boundaries for:
- readiness-closure governance artifacts, and
- mock/synthetic datasets used to design validation and evidence structures.

---

## Role matrix (v1)

### Program Director
- **role name**: Program Director
- **purpose**: Own readiness-closure governance; ensure scope/access discipline; arbitrate exceptions and break-glass; coordinate VSG readiness.
- **allowed artifacts/data classes**:
  - readiness-closure governance docs (all folders under `docs/readiness-closure/`)
  - decision records and registers (read/write where explicitly authorized by governance rules)
  - mock/synthetic perimeter identifiers (scope artifacts only)
- **allowed actions**:
  - approve access requests per baseline approval model
  - approve break-glass activation (time-bound) and require after-action review
  - edit governance artifacts and records that are within readiness-closure governance scope
- **prohibited actions**:
  - approve pilot entry/execution (requires R17 pass + GO decision record; outside this baseline)
  - authorize use of real employee data without privacy/security clearance bundles
- **approval required from**:
  - for granting worker/pay data access: Privacy Lead + relevant Data Owner co-approval still required
- **logging required**:
  - role membership changes; approvals; break-glass events; edits to governance artifacts
- **recertification expectation**:
  - monthly while Wave R is active
- **notes**:
  - must not self-approve access; must respect veto holders per Validation Charter

### Payroll Controls Lead
- **role name**: Payroll Controls Lead
- **purpose**: Control owner for payroll-truth, earning code governance implications, and remuneration-handling discipline during readiness-closure.
- **allowed artifacts/data classes**:
  - scope-lock records, reconciliation framework references, earning-code governance structures (where present)
  - mock/synthetic payroll data extracts (design-time only; no real extracts committed)
- **allowed actions**:
  - review/approve access to payroll-class worker/pay data (mock/synthetic) as Data Owner delegate for payroll domain
  - review evidence-structure definitions impacting payroll truth/reconciliation
- **prohibited actions**:
  - self-approval of privileged access
  - executing or authorizing pilot payroll extraction runs
- **approval required from**:
  - Privacy Lead for any worker/pay data access grants
  - Program Director for privileged access changes impacting controls
- **logging required**:
  - all access to worker/pay data classes; approval records
- **recertification expectation**:
  - monthly during readiness-closure
- **notes**:
  - veto authority exists in Validation Charter for unreconciled remuneration truth; not exercised via this matrix alone

### HRIS / People Data Owner
- **role name**: HRIS / People Data Owner
- **purpose**: Data owner for worker identity/job attributes and HRIS-derived fields used in readiness evidence designs.
- **allowed artifacts/data classes**:
  - mock/synthetic HRIS extracts (design-time only)
  - scope-lock and join-key strategy documentation
- **allowed actions**:
  - approve HRIS-class worker data access (mock/synthetic) when required for readiness-closure deliverables
  - review and challenge join-key and identity-grain assumptions in artifacts
- **prohibited actions**:
  - approving access that violates SoD or bypasses privacy review
  - authorizing real HRIS extracts for pilot execution
- **approval required from**:
  - Privacy Lead for any worker-level data access
- **logging required**:
  - all access to worker identity/job attribute data classes; approvals
- **recertification expectation**:
  - monthly during readiness-closure
- **notes**:
  - must ensure HRIS-related access is purpose-limited to readiness-closure artifacts

### Reward / Job Architecture Lead
- **role name**: Reward / Job Architecture Lead
- **purpose**: Methodology owner input; ensure job architecture and category methodology governance expectations are respected in readiness-closure artifacts.
- **allowed artifacts/data classes**:
  - methodology references and readiness-closure governance docs
  - mock/synthetic job architecture reference data (design-time only)
- **allowed actions**:
  - review and approve changes to governance artifacts that affect methodology expectations
  - request access for mock test fixtures needed to validate evidence structure
- **prohibited actions**:
  - self-approval of privileged access
  - authorizing any pilot execution based on readiness-closure docs
- **approval required from**:
  - Program Director for privileged edits to decision artifacts
  - Privacy Lead when access involves worker-level fields
- **logging required**:
  - approvals and edits to methodology-affecting artifacts
- **recertification expectation**:
  - monthly during readiness-closure
- **notes**:
  - methodology sign-off path is governed by Validation Charter; not completed here

### Privacy Lead
- **role name**: Privacy Lead
- **purpose**: Ensure lawful-basis posture, minimization, purpose limitation, and logging requirements are respected even in mock/test governance work.
- **allowed artifacts/data classes**:
  - privacy/security/access governance artifacts and bundles (structure only)
  - worker/pay data classes (mock/synthetic) for governance validation where explicitly required
- **allowed actions**:
  - approve/deny access to worker/pay data classes (mock/synthetic)
  - require minimization, masking, retention, and purpose statements in access requests
  - trigger veto processes (by decision record) if required by charter
- **prohibited actions**:
  - waiving logging requirements for worker/pay data access
  - claiming privacy approval for real pilot data processing
- **approval required from**:
  - relevant Data Owner (HRIS and/or Payroll Controls Lead) for domain-specific data access grants
- **logging required**:
  - all worker/pay data access; approvals/denials; break-glass notifications
- **recertification expectation**:
  - monthly during readiness-closure
- **notes**:
  - in any ambiguity, default to deny pending clarification (fail-closed)

### Security Architect
- **role name**: Security Architect
- **purpose**: Define and review access-control, logging, and break-glass expectations; ensure controlled handling for any dataset classes.
- **allowed artifacts/data classes**:
  - access model baseline artifacts
  - security approval bundle structures (not approvals themselves)
  - mock/synthetic worker/pay datasets only when necessary to validate control expectations
- **allowed actions**:
  - require logging/audit expectations for any sensitive access paths
  - approve access requests that enable bulk export/copying or other high-risk actions (in addition to Privacy/Data Owner)
- **prohibited actions**:
  - claiming security sign-off for pilot execution readiness
  - implementing IAM or production enforcement as part of readiness-closure governance docs
- **approval required from**:
  - Privacy Lead co-approval for worker/pay data access
  - Program Director for break-glass use pattern changes
- **logging required**:
  - privileged actions; bulk export attempts; break-glass events
- **recertification expectation**:
  - monthly during readiness-closure
- **notes**:
  - security approval is a separate readiness-closure item (R14); this matrix is not that approval

### Internal Audit / Assurance
- **role name**: Internal Audit / Assurance
- **purpose**: Provide independent assurance that controls are designed and that access/logging expectations are reviewable and non-bypassable.
- **allowed artifacts/data classes**:
  - all governance artifacts (read-only by default)
  - access logs and approval records (where available) for review
  - worker/pay data (mock/synthetic) only if required to audit access discipline; prefer metadata/logs over data
- **allowed actions**:
  - review access grants and break-glass events
  - request evidence of logging/recertification processes
  - provide acknowledgement (not self-executed approval) where called for in approval model
- **prohibited actions**:
  - generating or materially editing the evidence artifacts they later assure (except where explicitly part of an agreed control design drafting process)
  - self-approval of access or control exceptions
- **approval required from**:
  - Privacy Lead for any worker/pay data access, even mock/synthetic
- **logging required**:
  - access to any worker/pay data classes; review actions if recorded
- **recertification expectation**:
  - quarterly (or at readiness-closure milestones), with ad-hoc review after break-glass
- **notes**:
  - SoD: audit role should remain independent of implementation/edit roles

### QA / Validation Lead
- **role name**: QA / Validation Lead
- **purpose**: Ensure readiness-closure outputs are internally consistent, traceable to governing artifacts, and suitable for readiness re-review packaging.
- **allowed artifacts/data classes**:
  - readiness-closure governance docs (read/write on validation-specific artifacts)
  - mock/synthetic datasets needed to validate artifact structure (minimal subsets)
- **allowed actions**:
  - edit validation-facing governance docs within readiness-closure scope
  - request access needed to validate evidence structures
- **prohibited actions**:
  - granting access without approvals
  - using readiness-closure access to perform pilot execution
- **approval required from**:
  - Program Director for write access to decision-critical artifacts
  - Privacy Lead + Data Owner for worker/pay data access
- **logging required**:
  - edits; worker/pay data access
- **recertification expectation**:
  - monthly during readiness-closure
- **notes**:
  - validation evidence is not fabricated; this role validates structure and completeness of governance artifacts

### Engineering / Implementation
- **role name**: Engineering / Implementation
- **purpose**: Provide technical support for governance artifacts and future enforcement planning; produce mock/test fixtures where allowed by governance.
- **allowed artifacts/data classes**:
  - readiness-closure governance docs (read-only by default; write only where assigned)
  - mock/synthetic worker/pay datasets only when explicitly required for readiness-closure governance validation
- **allowed actions**:
  - draft and update readiness-closure governance docs in assigned scope
  - support logging expectation definitions (without implementing product/IAM)
- **prohibited actions**:
  - granting or self-approving privileged access
  - implementing IAM integration, security enforcement, or product features (out of scope for readiness-closure governance)
  - accessing worker/pay data without explicit approvals and logging
- **approval required from**:
  - Privacy Lead + relevant Data Owner for any worker/pay data access
  - Security Architect for privileges enabling bulk export/copying
- **logging required**:
  - all worker/pay data access; privileged actions; edits to governance artifacts
- **recertification expectation**:
  - monthly during readiness-closure
- **notes**:
  - this role is not an approval authority for access governance decisions

### Read-only Reviewer
- **role name**: Read-only Reviewer
- **purpose**: Allow stakeholders to review readiness-closure artifacts without edit privileges.
- **allowed artifacts/data classes**:
  - governance artifacts only (no worker/pay data by default)
- **allowed actions**:
  - read and comment outside the repo (or via controlled review process)
- **prohibited actions**:
  - any edits to decision records, scope lock records, or access model artifacts
  - any access to worker/pay data classes unless explicitly approved for a specific review need
- **approval required from**:
  - Program Director for assignment
  - Privacy Lead + Data Owner if any worker/pay data access is requested
- **logging required**:
  - role membership changes; document access if available
- **recertification expectation**:
  - quarterly (or at readiness-closure milestone transitions)
- **notes**:
  - default onboarding role; provides “no ad-hoc access” landing state

