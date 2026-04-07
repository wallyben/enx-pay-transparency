# Readiness-Closure Phase (Wave R)

## What this is

The **Readiness-Closure phase** is a **governance/program-control** phase that exists to close readiness evidence gaps after a pilot readiness review returned **NOT READY**.

This phase is **evidence-closure**, not pilot execution:
- it produces a **dry-run readiness evidence bundle** (structure + required references, without fabricating results),
- it packages **privacy**, **security**, and **access-model** clearance bundles for review,
- it culminates in a **second pilot readiness review (R17)**.

**Binding rule:** Pilot entry and pilot execution remain **prohibited** until **R17** passes.

Authoritative queue and status live in `.claude/SLICE_QUEUE.md`.

## Why this exists

Pilot execution is high-risk without closed controls. Readiness-Closure ensures the program can demonstrate:
- controlled scope,
- controlled access and approvals,
- extract feasibility and join/reconciliation measurability,
- governed mapping and methodology calibration evidence requirements,
- explicit exception handling and disposition discipline,
- confidence output structure aligned to fail-closed gates,
- a consolidated, reviewable decision record pack.

## Work items (R01–R17)

These work items are mandatory and must be completed in order. This repo transition creates **scaffolding only**—it does not execute the pilot and does not generate fake evidence.

### R01 — `no_go_decision_and_charter_adoption`
Formalize the **NOT READY** outcome as a no-go, adopt the Readiness-Closure charter/phase rules, and freeze pilot entry and downstream feature resumption.

### R02 — `pilot_scope_lock`
Lock the pilot scope (systems, entities, field set, inclusions/exclusions) for readiness re-review.

### R03 — `access_model_baseline`
Baseline the access model (who needs access, via what roles/groups, what is logged, what is masked).

### R04 — `source_extract_proof`
Prove the required extracts can be produced (without committing real extracts or sensitive data into the repo).

### R05 — `join_integrity_proof`
Prove join integrity can be measured and reported at required join boundaries (without committing fabricated results).

### R06 — `earning_code_inventory_and_mapping_lock`
Lock earning-code inventory and mapping governance so remuneration truth cannot drift.

### R07 — `payroll_reconciliation_dry_run`
Dry-run reconciliation evidence structure and obligations, anchored to payroll truth (no results committed in this phase transition).

### R08 — `exception_register_and_disposition`
Set up the exception register structure and disposition governance (append-only, owned, approved).

### R09 — `confidence_output_dry_run`
Dry-run confidence outputs and gate evaluation structure aligned to Confidence Model v1 (no fabricated outputs).

### R10 — `methodology_calibration_evidence`
Define the calibration evidence bundle requirements for Methodology v1 (no calibration performed in this phase transition).

### R11 — `decision_record_pack`
Define the decision record pack format and indexing needed for readiness re-review.

### R12 — `gold_pack_execution_evidence`
Define the evidence structure required to demonstrate gold/test-pack execution (without executing packs here).

### R13 — `privacy_approval_bundle`
Create the approval bundle structure and references required for privacy clearance (no approvals executed here).

### R14 — `security_approval_bundle`
Create the approval bundle structure and references required for security clearance (no approvals executed here).

### R15 — `access_model_evidence`
Define the evidence required to support the access model (approvals, group membership, logging proof expectations).

### R16 — `consolidated_readiness_bundle`
Assemble the consolidated readiness bundle index that references all required evidence artifacts.

### R17 — `second_pilot_readiness_review`
Conduct the second readiness review and record the outcome. Only a passing outcome enables pilot entry or feature resumption.

## Folder scaffolding in this repo

This folder structure mirrors the R-items so readiness-closure evidence can be organized without mixing it with pilot execution outputs.

- `00_charter/`: R01 governance artifacts (no-go, adoption records)
- `01_decision-log/`: decision records pack index (append-only discipline)
- `02_scope-lock/`: R02 scope lock artifacts
- `03_extract-proof/`: R04 extract feasibility proof artifacts (no raw extracts committed)
- `04_join-integrity/`: R05 join integrity measurement proof structure
- `05_mapping-governance/`: R06 mapping governance + lock artifacts
- `06_reconciliation/`: R07 reconciliation dry-run structure
- `07_exceptions/`: R08 exception register structure
- `08_confidence-output/`: R09 confidence output dry-run structure
- `09_methodology-calibration/`: R10 calibration evidence structure
- `10_goldpack-testpack/`: R12 evidence structure for gold/test-pack execution
- `11_privacy-bundle/`: R13 privacy clearance bundle structure
- `12_security-bundle/`: R14 security clearance bundle structure
- `13_access-model/`: R03/R15 access model baseline + evidence structure
- `99_review-bundle/`: R16 consolidated readiness bundle (index + references)

## Non-goals (binding)

- No product code changes.
- No pilot execution.
- No creation of fake evidence artifacts.
- No starting R02+ content work as part of this transition.
