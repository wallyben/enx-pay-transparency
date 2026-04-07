# REDIRECT_DECISION.md
# Enterprise Hardening Redirect — Decision Record (Binding)
# Date: 2026-04-07

This document records the binding decision to redirect the Euronext Pay Transparency Control Tower from feature delivery to enterprise hardening and validation-first execution.

This is an operational decision record. It exists to prevent the repo from drifting back into the pre-redirect slice sequence and to define the conditions under which downstream work may resume.

---

## 1. Decision statement

Effective immediately, the project is redirected from “continue feature slices” to **enterprise hardening**.

This is not a rebuild. The existing deterministic control-engine core remains the foundation.

**Binding rule:** No further product expansion proceeds until the hardening validation gates pass and the resumption decision is recorded.

---

## 2. Why the redirect was made (root causes)

The core risks are not application-code defects. The high-probability failure modes are:

- **Source-of-truth ambiguity** across systems (Workday vs payroll vs reward). Canonical data does not establish truth.
- **Payroll reconciliation not proven**. Payroll outputs must anchor remuneration truth; without reconciliation the platform can be confidently wrong.
- **Category/equal-value methodology not yet defensible**. Title normalization + overrides is a mechanism, not a legally defensible, governed methodology package.
- **Governance gaps**. Ownership, approvals, attestations, and veto rights are not yet embedded into an enforceable operating model.
- **Privacy/security mistakes**. Worker-level pay and identity data requires explicit purpose limitation, minimization, access control, logging, and retention discipline before pilot use.

---

## 3. What was paused / frozen (immediate stop)

The following are frozen until pilot pass criteria are met:

- **S13 `group_dashboard_core`** and any additional dashboards/reporting expansion
- **Wave 4** casework and remediation slices (S14–S17)
- **Wave 5** policy registry and recruiting controls (S18–S19)
- **Wave 6** country pack expansion (S20–S31)
- **Wave 7** downstream release/hardening features (S32–S35)

These slices remain in the queue for traceability, but are marked **DEFERRED** (S13) or **PAUSED** (downstream waves) in `.claude/SLICE_QUEUE.md`.

---

## 4. What is now the priority (hardening priorities)

The next phase is enterprise validation and hardening. The priorities are:

1) **Source-of-Truth Hardening**
- For every critical field: define system of record, derivation logic, business owner, reconciliation method, tolerance thresholds, and failure severity.
- Principle: **Payroll is the anchor truth for remuneration**, unless explicitly justified otherwise for a specific field.

2) **Category & Equal-Value Methodology (Defensible Methodology Product)**
- Establish a formal, governed methodology v1:
  - factor model (skills, effort, responsibility, working conditions)
  - scoring + weighting
  - calibration protocol
  - review/challenge protocol
  - controlled overrides with approval + expiry + auditability
  - versioning and change control

3) **Enterprise Pilot (Constrained)**
- One country, one payroll provider, limited entity scope.
- Prove reconciliation, trusted categories, explainability, and data control posture.

4) **Governance & Operating Model**
- Ownership is enterprise:
  - Reward → methodology
  - Payroll → remuneration truth
  - HRIS → worker/job integrity
  - Legal → defensibility
  - Security/Privacy → data controls
  - Internal Audit → assurance
- Embed approvals, attestations, audit trails, and fail-closed gates.

---

## 5. Hardening Wave (Wave H) — required deliverables

Wave H is inserted before any further product expansion. It is docs-only at this stage and must produce governance-grade artifacts that can drive implementation slices safely.

### H01 — validation_charter_and_gates
- Produce the Validation Charter v1 structure, with:
  - pilot scope definition
  - in-scope systems/entities
  - mandatory fields + reconciliations
  - methodology sign-off path
  - privacy/security approvals
  - pass/fail gates
  - veto rights
  - go/no-go authority

### H02 — field_level_source_of_truth_matrix_v1
- Produce Field-Level Source-of-Truth Matrix v1:
  - SoR per critical field
  - derivation logic and precedence rules
  - owner and reconciliation method
  - tolerance thresholds and failure severity (blocker vs warning)
  - privacy classification, access model, retention
  - pilot-mandatory marking

### H03 — methodology_v1_package
- Produce Methodology v1 package:
  - factor model, scoring model, weighting
  - calibration and challenge process
  - override rules, expiry, approval model
  - methodology versioning and change control
  - evidence required for sign-off

### H04 — reconciliation_framework_and_exception_taxonomy
- Define reconciliation framework anchored to payroll results:
  - what must reconcile (join integrity, pay components, aggregates, inclusion/exclusion)
  - comparison levels and tolerances
  - exception taxonomy and severity rules
  - rerun discipline and evidence outputs

### H05 — confidence_model_and_fail_closed_gates
- Define confidence scoring model:
  - field-level and record-level scoring inputs
  - thresholds and propagation rules
  - fail-closed triggers
  - how confidence gates category assignment, metrics, and reporting packs

### H06 — pilot_gold_packs_and_validation_tests
- Define pilot gold datasets and validation test packs:
  - required pilot extracts (Workday/HRIS, payroll, reward/job architecture)
  - gold pack structure and expected outcomes
  - sample test pack scenarios (retro pay, off-cycle, unmapped earning codes, join duplicates, missing gender, FTE mismatch)

---

## 6. Pilot pass criteria (hard gate before resuming downstream slices)

Downstream slices may not resume until the pilot has passed and the go/no-go decision is recorded.

Minimum pilot pass criteria:
- **>=99% data join integrity across sources**
- **Payroll vs system remuneration outputs within agreed tolerance**
- **Category assignments approved by Reward**
- **Methodology v1 signed off by Legal**
- **Zero critical audit/privacy issues**
- **Full explainability at worker level** (traceable inputs → derivations → methodology version → decision records → outputs)

---

## 7. Authority and veto rights (enforcement)

This redirect requires explicit authority:
- **Go/No-Go authority**: program steering body (named in Validation Charter v1) with quorum and decision log.
- **Veto rights** (hard stops):
  - Privacy/GDPR lead: purpose limitation, minimization, retention, access violations
  - Security architect: unacceptable access control/logging gaps
  - Internal Audit/Assurance lead: missing evidence, non-reproducibility, control bypass
  - Legal: methodology not defensible or approval evidence insufficient
  - Payroll controls lead: remuneration truth not reconciled to payroll results

---

## 8. Where the redirect is enforced in-repo

- `.claude/SLICE_QUEUE.md`: Wave H inserted; S13 deferred; downstream waves paused; H01 set as current active slice.
- `.claude/PROJECT_PLAN.md`: Enterprise Hardening Redirect section added; validation-first gates stated as binding.

