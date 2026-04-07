## SYNTHETIC DATA ONLY — NOT REAL PILOT EVIDENCE

**SYNTHETIC DATA ONLY**  
**NOT REAL PILOT EVIDENCE**  
**NOT FOR LEGAL OR REGULATORY RELIANCE**

This mock-run plan explains how the synthetic datasets under `mock-enterprise/generated/` are intended to exercise the Control Tower end to end, including clean passes and controlled failures/edge cases.

### Perimeter (synthetic)
- **Country**: IE
- **Entity**: `LE-IE-SYNTH-001`
- **Payroll provider**: `PAYPROV-IE-SYNTH-001`
- **Pay period**: 2026-02-01 to 2026-02-28
- **Currency**: EUR
- **Seed**: 20260407 (deterministic)

---

## 1. What each file is for

- `hris_workers.csv`
  - **Purpose**: worker identity + demographic + org attributes used for eligibility, grouping dimensions, and mandatory field gates.
  - **Controls exercised**: mandatory field completeness (gender), perimeter constraints (country/entity), explainability joins.

- `hris_assignments.csv`
  - **Purpose**: assignment grain and “primary assignment” logic, plus job references for category/methodology.
  - **Controls exercised**: multi-assignment primary-only inclusion; missing FTE; ambiguous job evidence (job_level mismatch vs job architecture).

- `job_architecture.csv`
  - **Purpose**: job catalog and factor scores aligned to Methodology v1 factor model (skills/effort/responsibility/conditions).
  - **Controls exercised**: methodology-evidence traceability; review-required when job evidence conflicts.

- `hris_payroll_crosswalk.csv`
  - **Purpose**: deterministic HRIS↔Payroll worker identity crosswalk.
  - **Controls exercised**: missing join failures; duplicate join key/cardinality ambiguity.

- `payroll_runs.csv`
  - **Purpose**: payroll period/run metadata for the closed regular on-cycle run.
  - **Controls exercised**: perimeter period alignment, run metadata completeness, currency consistency.

- `earning_code_mapping.csv`
  - **Purpose**: earning code → canonical component family mapping (including blocker/unmapped states).
  - **Controls exercised**: mapping governance blockers; suspected misclassification review.

- `payroll_earnings.csv`
  - **Purpose**: payroll earning lines (base + variable) plus controlled excluded lines (off-cycle/retro/allowance) and controlled mapping issues.
  - **Controls exercised**: mapping blockers; off-cycle/retro exclusion; allowance exclusion; variable pay; reconciliation-driven gating.

- `expected_scenario_manifest.csv`
  - **Purpose**: authoritative scenario index describing intended control outcomes and record counts for each scenario.
  - **Controls exercised**: runbook alignment and expected result verification.

---

## 2. How the datasets join together (key joins)

1) Worker identity
- `hris_workers.hris_worker_id` joins to `hris_assignments.hris_worker_id`

2) Job/position evidence
- `hris_assignments.position_id` joins to `job_architecture.position_id`

3) HRIS↔Payroll join
- `hris_workers.hris_worker_id` joins to `hris_payroll_crosswalk.hris_worker_id`
- `hris_payroll_crosswalk.payroll_worker_id` joins to `payroll_earnings.payroll_worker_id`

4) Payroll period/run
- `payroll_runs.payroll_run_id` joins to `payroll_earnings.payroll_run_id`

5) Earning code mapping
- `payroll_earnings.earning_code` joins to `earning_code_mapping.earning_code`
  - Note: `UNMAPPED_X` is intentionally **unmapped** and should trigger mapping blockers.

---

## 3. Scenario coverage mapping (controls expected to trigger)

Use `expected_scenario_manifest.csv` as the source of truth for scenario intent. The generator assigns each worker a “primary scenario”; some scenarios also add extra payroll lines.

### Scenarios that should pass cleanly (ALLOW)
- **SCN-001 Clean happy-path workers**
  - Expected: joins PASS, mapping PASS, reconciliation within tolerance (synthetic), confidence PASS, export ALLOW.

- **SCN-017 Base pay clean cases**
  - Expected: base pay lines map to BASE; clean eligibility.

- **SCN-018 Variable pay / bonus cases**
  - Expected: BONUS lines present and mapped to VARIABLE; clean eligibility.

- **SCN-020 Worker-level explainability trace complete**
  - Expected: deterministic trace across IDs and joins; export ALLOW.

### Scenarios that should cause join exceptions (BLOCK_EXPORT)
- **SCN-002 Missing payroll join**
  - Trigger: `hris_payroll_crosswalk` has `crosswalk_status=MISSING` and empty `payroll_worker_id`.
  - Expected: join BLOCKER; downstream blocked.

- **SCN-003 Duplicate join key**
  - Trigger: two HRIS workers share the same `payroll_worker_id`.
  - Expected: ambiguous join/cardinality BLOCKER; no smoothing; downstream blocked.

### Scenarios that should cause mandatory-field blockers (BLOCK_EXPORT)
- **SCN-004 Missing mandatory gender**
  - Trigger: `hris_workers.gender` empty.
  - Expected: fail-closed mandatory reporting dimension missing.

- **SCN-005 Missing FTE fraction**
  - Trigger: `hris_assignments.fte_fraction` empty on primary assignment.
  - Expected: fail-closed for pilot-mandatory normalization input.

### Scenarios that should cause mapping blockers / reconciliation blockers (BLOCK_EXPORT)
- **SCN-006 Unmapped earning code**
  - Trigger: payroll line(s) with `earning_code=UNMAPPED_X`; `earning_code_mapping` marks it UNMAPPED with `blocker_flag=Y`.
  - Expected: mapping blocker, reconciliation BLOCKER_EXCEPTION, export blocked.

- **SCN-007 Suspected earning-code misclassification**
  - Trigger: `SUSPECT_BASE` is mapped to VARIABLE but looks “base-like” via `component_family_candidate=BASE`.
  - Expected: review-required / warning-type reconciliation signal; export blocked until disposition.

### Scenarios that should exercise methodology/override governance states
- **SCN-011 Ambiguous job evidence**
  - Trigger: `hris_assignments.job_level` mismatches `job_architecture.job_level` for the same `position_id`.
  - Expected: methodology review-required state (evidence conflict) and export blocked.

- **SCN-008 Pending override blocks downstream truth**
  - This pack encodes the *intent* as a scenario assignment; the demo run should treat the affected workers as if an override exists but is **PENDING** (fail-closed).
  - Expected: downstream blocked for affected records.

- **SCN-009 Approved override with evidence**
  - This pack encodes the *intent* as a scenario assignment; the demo run should treat the affected workers as if an override exists and is **APPROVED** and in-date.
  - Expected: allow run for those workers (subject to other gates).

- **SCN-010 Methodology version mismatch**
  - This pack encodes the *intent* as a scenario assignment; the demo run should simulate a run manifest mismatch (methodology version differs) and confirm fail-closed behavior.
  - Expected: export blocked.

### Scenarios that should cause export/run gating failures (run-level)
- **SCN-012 Run-level blocked-record threshold breach**
- **SCN-013 Run-level low-confidence threshold breach**
  - This pack provides a baseline dataset and the manifest intent. To demonstrate run-level gating, run the same pipeline with **increased** edge/failure allocations (or lower thresholds) so that blocked/low-confidence rates exceed configured limits.
  - Expected: metrics run marked invalid / export gated at run-level.

### Scenarios where specific payroll rows are present but excluded by scope
- **SCN-014 Off-cycle rows present but excluded**
  - Trigger: `payroll_earnings.off_cycle_flag=Y` rows present.
  - Expected: excluded from in-scope computations; should be visible and explainable as excluded-by-policy.

- **SCN-015 Retro rows present but excluded**
  - Trigger: `payroll_earnings.retro_flag=Y` rows present.
  - Expected: excluded from in-scope computations; visible as excluded-by-policy.

- **SCN-016 Allowance rows present but excluded**
  - Trigger: `payroll_earnings.earning_code=ALLOW_TRAVEL` present and mapped to `EXCLUDED`.
  - Expected: excluded from in-scope computations; visible as excluded-by-policy.

### Multi-assignment behavior
- **SCN-019 Multi-assignment primary-only should count**
  - Trigger: workers have multiple assignments but only one `primary_assignment_flag=Y`.
  - Expected: downstream should use only primary assignment for worker inclusion/category; secondary assignment should not double-count.

---

## 4. Expected gate outcomes summary (what should fail where)

For a typical demo run of this pack:
- **Join exceptions**: SCN-002, SCN-003
- **Mapping blockers**: SCN-006
- **Reconciliation blockers**: SCN-006 (blocker), SCN-007 (review/warning-type but still blocks export in this demo pack)
- **Confidence fail-closed triggers**: SCN-002, SCN-003, SCN-004, SCN-005, SCN-006, SCN-008, SCN-010
- **Methodology review-required states**: SCN-011 (+ SCN-007 as suspected misclassification review)
- **Export/run gating failures**: SCN-002/003/004/005/006/007/008/010/011 should block export; SCN-012/013 are for run-level invalidation demonstrations

---

## 5. Operating notes for demonstration

- This pack is designed to prove **system behavior** deterministically:
  - joins are internally consistent except for intentional scenario injections
  - mapping table includes explicit unmapped blockers
  - excluded-by-policy payroll lines are flagged
- Do not interpret any outputs as real compliance evidence.
- Do not use this pack for privacy/security sign-offs; it contains only synthetic data and does not represent real data handling.

